require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app = express()

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://bonpan.co',
  'https://www.bonpan.co',
]
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error('No permitido por CORS'))
  }
}))
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

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`\n🥐 Bon Pan API corriendo en http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})
