require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app = express()

// ── Middleware ────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Request logger ────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString('es-CO')}  ${req.method} ${req.path}`)
  next()
})

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/productos', require('./routes/productos'))
app.use('/api/pedidos',   require('./routes/pedidos'))
app.use('/api/clientes',  require('./routes/clientes'))
app.use('/api/actividad', require('./routes/actividad'))
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/usuarios',  require('./routes/usuarios'))
app.use('/api/upload',      require('./routes/upload'))
app.use('/api/promociones',  require('./routes/promociones'))
app.use('/api/puntos-venta', require('./routes/puntosVenta'))
app.use('/api/zonas',        require('./routes/zonas'))
app.use('/api/pagos',        require('./routes/pagos'))

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Migraciones automáticas ───────────────────────────────────
const db = require('./db')
async function runMigrations() {
  try {
    await db.query(`ALTER TABLE productos ADD COLUMN IF NOT EXISTS description_en TEXT`)
    console.log('✅ Migración: description_en lista')
    await db.query(`
      ALTER TABLE pedidos
        ADD COLUMN IF NOT EXISTS payment_status       VARCHAR(30),
        ADD COLUMN IF NOT EXISTS payment_reference    VARCHAR(100),
        ADD COLUMN IF NOT EXISTS wompi_transaction_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS payment_method       VARCHAR(50)
    `)
    console.log('✅ Migración: columnas de pago (Wompi) listas')
    await db.query(`
      CREATE TABLE IF NOT EXISTS puntos_de_venta (
        id         SERIAL PRIMARY KEY,
        nombre     VARCHAR(100) NOT NULL,
        direccion  VARCHAR(200),
        telefono   VARCHAR(30),
        pin        VARCHAR(30)  NOT NULL,
        activo     BOOLEAN      DEFAULT TRUE,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      )
    `)
    await db.query(`
      ALTER TABLE puntos_de_venta
        ADD COLUMN IF NOT EXISTS hora_apertura VARCHAR(5),
        ADD COLUMN IF NOT EXISTS hora_cierre   VARCHAR(5)
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS pv_dispositivos (
        id             SERIAL PRIMARY KEY,
        punto_venta_id INTEGER      NOT NULL REFERENCES puntos_de_venta(id) ON DELETE CASCADE,
        nombre         VARCHAR(150),
        device_token   VARCHAR(80)  NOT NULL,
        aprobado       BOOLEAN      DEFAULT FALSE,
        created_at     TIMESTAMPTZ  DEFAULT NOW(),
        last_used_at   TIMESTAMPTZ,
        UNIQUE (device_token, punto_venta_id)
      )
    `)
    await db.query(`
      CREATE TABLE IF NOT EXISTS pv_accesos (
        id             SERIAL PRIMARY KEY,
        punto_venta_id INTEGER REFERENCES puntos_de_venta(id)  ON DELETE SET NULL,
        dispositivo_id INTEGER REFERENCES pv_dispositivos(id)  ON DELETE SET NULL,
        exito          BOOLEAN NOT NULL,
        motivo         VARCHAR(120),
        ip             VARCHAR(64),
        user_agent     TEXT,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    console.log('✅ Migración: seguridad de puntos de venta lista')
    await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`)
    console.log('✅ Migración: teléfono en usuarios listo')
    await db.query(`
      CREATE TABLE IF NOT EXISTS zonas_cobertura (
        id         SERIAL PRIMARY KEY,
        ciudad     VARCHAR(50)  NOT NULL DEFAULT 'Ibagué',
        nombre     VARCHAR(100) NOT NULL,
        costo      INTEGER      NOT NULL DEFAULT 4000 CHECK (costo >= 0),
        activa     BOOLEAN      DEFAULT TRUE,
        created_at TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE (ciudad, nombre)
      )
    `)
    await db.query(`
      ALTER TABLE pedidos
        ADD COLUMN IF NOT EXISTS tipo_entrega      VARCHAR(20),
        ADD COLUMN IF NOT EXISTS ciudad_entrega    VARCHAR(50),
        ADD COLUMN IF NOT EXISTS zona_entrega      VARCHAR(100),
        ADD COLUMN IF NOT EXISTS direccion_entrega VARCHAR(200),
        ADD COLUMN IF NOT EXISTS costo_domicilio   INTEGER DEFAULT 0
    `)
    // Barrios iniciales de Ibagué — solo la primera vez (luego se administran desde el panel)
    const { rows: zCount } = await db.query('SELECT COUNT(*)::int AS n FROM zonas_cobertura')
    if (zCount[0].n === 0) {
      const barrios = [
        // [nombre, costo]
        ['Centro',          3000], ['La Pola',        3000], ['Belén',          3000],
        ['Interlaken',      3000], ['San Simón',      3000], ['Restrepo',       3000],
        ['Gaitán',          3000], ['Macarena',       3000], ['Cádiz',          3000],
        ['Claret',          3000],
        ['Piedra Pintada',  4000], ['Calambeo',       4000], ['Ambalá',         4000],
        ['Jordán',          4000], ['El Vergel',      4000], ['Santa Helena',   4000],
        ['La Francia',      4000], ['La Gaviota',     4000], ['Varsovia',       4000],
        ['Simón Bolívar',   4000],
        ['El Salado',       5000], ['Picaleña',       5000], ['Mirolindo',      5000],
        ['La Samaria',      5000], ['El Topacio',     5000], ['Boquerón',       5000],
      ]
      for (const [nombre, costo] of barrios) {
        await db.query(
          `INSERT INTO zonas_cobertura (ciudad, nombre, costo) VALUES ('Ibagué', $1, $2)
           ON CONFLICT (ciudad, nombre) DO NOTHING`,
          [nombre, costo]
        )
      }
      console.log('✅ Migración: zonas de cobertura de Ibagué sembradas')
    }
    console.log('✅ Migración: zonas de cobertura listas')
    await db.query(`ALTER TABLE puntos_de_venta ADD COLUMN IF NOT EXISTS recibe_domicilios BOOLEAN DEFAULT FALSE`)
    // Si ningún local recibe los domicilios aún, asignarlo al "Central" (o al primero activo)
    await db.query(`
      UPDATE puntos_de_venta SET recibe_domicilios = TRUE
      WHERE id = (
        SELECT id FROM puntos_de_venta WHERE activo = TRUE
        ORDER BY (nombre ILIKE '%central%') DESC, id LIMIT 1
      )
      AND NOT EXISTS (SELECT 1 FROM puntos_de_venta WHERE recibe_domicilios = TRUE)
    `)
    console.log('✅ Migración: local receptor de domicilios listo')
  } catch (e) {
    console.error('⚠️ Migración falló:', e.message)
  }
}

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000
app.listen(PORT, async () => {
  console.log(`\n🥐 Bon Pan API corriendo en http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
  await runMigrations()
})
