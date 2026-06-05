const router = require('express').Router()
const db     = require('../db')

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM productos WHERE active = TRUE ORDER BY category, name'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM productos WHERE id = $1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/productos
router.post('/', async (req, res) => {
  const { name, category, price, description, emoji, stock } = req.body
  try {
    const { rows } = await db.query(
      `INSERT INTO productos (name, category, price, description, emoji, stock)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, category, price, description, emoji || '🥐', stock ?? 0]
    )
    await db.query(
      `INSERT INTO actividad_log (type, description, data) VALUES ($1,$2,$3)`,
      ['producto', `Producto creado: ${name}`, JSON.stringify(rows[0])]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  const { name, category, price, description, emoji, stock } = req.body
  try {
    const { rows } = await db.query(
      `UPDATE productos SET name=$1, category=$2, price=$3, description=$4, emoji=$5, stock=$6
       WHERE id=$7 RETURNING *`,
      [name, category, price, description, emoji, stock, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' })
    await db.query(
      `INSERT INTO actividad_log (type, description, data) VALUES ($1,$2,$3)`,
      ['producto', `Producto editado: ${name}`, JSON.stringify(rows[0])]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/productos/:id  (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE productos SET active = FALSE WHERE id = $1 RETURNING name',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' })
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['producto', `Producto eliminado: ${rows[0].name}`]
    )
    res.json({ message: 'Producto eliminado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
