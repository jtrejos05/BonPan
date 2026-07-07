const router = require('express').Router()
const db     = require('../db')
const { adminOnly } = require('../middleware/staffAuth')

// ── GET /api/zonas — zonas activas (público: selector del checkout) ──
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, ciudad, nombre, costo FROM zonas_cobertura
       WHERE activa = TRUE ORDER BY ciudad, nombre`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/zonas/admin — todas las zonas (admin) ────────────
router.get('/admin', adminOnly, async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM zonas_cobertura ORDER BY ciudad, nombre'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/zonas — crear zona (admin) ──────────────────────
router.post('/', adminOnly, async (req, res) => {
  const { ciudad, nombre, costo } = req.body
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre del barrio es requerido' })
  if (costo == null || Number(costo) < 0) return res.status(400).json({ error: 'El costo del domicilio es requerido' })
  try {
    const { rows } = await db.query(
      `INSERT INTO zonas_cobertura (ciudad, nombre, costo)
       VALUES ($1, $2, $3) RETURNING *`,
      [(ciudad || 'Ibagué').trim(), nombre.trim(), Number(costo)]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505' || /unique/i.test(err.message)) {
      return res.status(409).json({ error: 'Ese barrio ya existe' })
    }
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /api/zonas/:id — editar zona (admin) ──────────────────
router.put('/:id', adminOnly, async (req, res) => {
  const { ciudad, nombre, costo, activa } = req.body
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre del barrio es requerido' })
  try {
    const { rows } = await db.query(
      `UPDATE zonas_cobertura
       SET ciudad=$1, nombre=$2, costo=$3, activa=$4
       WHERE id=$5 RETURNING *`,
      [(ciudad || 'Ibagué').trim(), nombre.trim(), Number(costo) || 0, activa !== false, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Zona no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/zonas/:id/toggle — activar/desactivar (admin) ──
router.patch('/:id/toggle', adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE zonas_cobertura SET activa = NOT activa WHERE id=$1 RETURNING *',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Zona no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/zonas/:id — eliminar zona (admin) ─────────────
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM zonas_cobertura WHERE id=$1 RETURNING nombre', [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Zona no encontrada' })
    res.json({ message: `${rows[0].nombre} eliminado` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
