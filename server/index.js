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
