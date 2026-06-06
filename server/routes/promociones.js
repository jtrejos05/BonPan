const router = require('express').Router()
const db     = require('../db')

// GET /api/promociones — todas las promociones activas (para clientes)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM promociones
       WHERE activa = TRUE
         AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
         AND (fecha_fin    IS NULL OR fecha_fin    >= CURRENT_DATE)
       ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/promociones/admin — todas (para panel admin)
router.get('/admin', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM promociones ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/promociones/codigo/:codigo — validar código promocional
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM promociones
       WHERE UPPER(codigo) = UPPER($1)
         AND activa = TRUE
         AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
         AND (fecha_fin    IS NULL OR fecha_fin    >= CURRENT_DATE)`,
      [req.params.codigo]
    )
    if (!rows.length)
      return res.status(404).json({ error: 'Código inválido o expirado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/promociones — crear promoción
router.post('/', async (req, res) => {
  const { nombre, descripcion, tipo, valor, codigo, categorias, activa, fecha_inicio, fecha_fin, imagen, precio } = req.body
  if (!nombre || !valor) return res.status(400).json({ error: 'Nombre y valor son requeridos' })
  try {
    const { rows } = await db.query(
      `INSERT INTO promociones (nombre, descripcion, tipo, valor, codigo, categorias, activa, fecha_inicio, fecha_fin, imagen, precio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        nombre, descripcion || null, tipo || 'porcentaje', valor,
        codigo ? codigo.toUpperCase() : null,
        categorias?.length ? categorias : null,
        activa !== false,
        fecha_inicio || null,
        fecha_fin    || null,
        imagen       || null,
        precio       || null,
      ]
    )
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['producto', `Promoción creada: ${nombre}`]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe una promoción con ese código' })
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/promociones/:id — editar
router.put('/:id', async (req, res) => {
  const { nombre, descripcion, tipo, valor, codigo, categorias, activa, fecha_inicio, fecha_fin, imagen, precio } = req.body
  try {
    const { rows } = await db.query(
      `UPDATE promociones SET
         nombre=$1, descripcion=$2, tipo=$3, valor=$4, codigo=$5,
         categorias=$6, activa=$7, fecha_inicio=$8, fecha_fin=$9,
         imagen=$10, precio=$11
       WHERE id=$12 RETURNING *`,
      [
        nombre, descripcion || null, tipo, valor,
        codigo ? codigo.toUpperCase() : null,
        categorias?.length ? categorias : null,
        activa !== false,
        fecha_inicio || null,
        fecha_fin    || null,
        imagen       || null,
        precio       || null,
        req.params.id,
      ]
    )
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' })
    res.json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe una promoción con ese código' })
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/promociones/:id/toggle — activar/pausar
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE promociones SET activa = NOT activa WHERE id = $1 RETURNING *',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/promociones/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM promociones WHERE id = $1 RETURNING nombre',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Promoción no encontrada' })
    res.json({ message: `Promoción "${rows[0].nombre}" eliminada` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/promociones/:id/usar — incrementar contador de usos
router.post('/:id/usar', async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE promociones SET usos = usos + 1 WHERE id = $1 RETURNING usos',
      [req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
