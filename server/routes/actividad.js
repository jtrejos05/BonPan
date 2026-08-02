const router = require('express').Router()
const db     = require('../db')
const { requireStaff } = require('../middleware/authMiddleware')

// GET /api/actividad?limit=50&type=pedido
router.get('/', requireStaff, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500)
  const type  = req.query.type
  try {
    const { rows } = type
      ? await db.query(
          'SELECT * FROM actividad_log WHERE type=$1 ORDER BY created_at DESC LIMIT $2',
          [type, limit])
      : await db.query(
          'SELECT * FROM actividad_log ORDER BY created_at DESC LIMIT $1',
          [limit])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/actividad — registrar evento manual (ej: carrito desde frontend)
// Abierto a visitantes, pero solo para tipos de evento no sensibles.
// El staff autenticado puede registrar cualquier tipo (ej: 'sistema').
const TIPOS_PUBLICOS = ['carrito', 'pedido']

function permitirEvento(req, res, next) {
  if (TIPOS_PUBLICOS.includes(req.body?.type)) return next()
  const [autenticar, verificarRol] = requireStaff
  autenticar(req, res, () => verificarRol(req, res, next))
}

router.post('/', permitirEvento, async (req, res) => {
  const { type, description, data } = req.body
  try {
    const { rows } = await db.query(
      `INSERT INTO actividad_log (type, description, data) VALUES ($1,$2,$3) RETURNING *`,
      [type, description, data ? JSON.stringify(data) : null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
