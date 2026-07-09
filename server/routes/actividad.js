const router = require('express').Router()
const db     = require('../db')
const { adminOnly } = require('../middleware/staffAuth')

// GET /api/actividad?limit=50&type=pedido (admin)
router.get('/', adminOnly, async (req, res) => {
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
router.post('/', async (req, res) => {
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
