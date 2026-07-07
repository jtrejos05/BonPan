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
