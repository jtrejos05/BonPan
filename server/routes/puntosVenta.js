const router = require('express').Router()
const db     = require('../db')
const jwt    = require('jsonwebtoken')
const { requireAdmin, requireStaff } = require('../middleware/authMiddleware')

// ── GET /api/puntos-venta — listar todos (admin) ──────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nombre, direccion, telefono, activo, created_at FROM puntos_de_venta ORDER BY id'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/puntos-venta — crear punto de venta ─────────────
router.post('/', requireAdmin, async (req, res) => {
  const { nombre, direccion, telefono, pin } = req.body
  if (!nombre || !pin) return res.status(400).json({ error: 'Nombre y PIN son requeridos' })
  if (pin.length < 4)  return res.status(400).json({ error: 'El PIN debe tener al menos 4 dígitos' })
  try {
    const { rows } = await db.query(
      `INSERT INTO puntos_de_venta (nombre, direccion, telefono, pin)
       VALUES ($1,$2,$3,$4) RETURNING id, nombre, direccion, telefono, activo, created_at`,
      [nombre, direccion || null, telefono || null, pin]
    )
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['sistema', `Punto de venta creado: ${nombre}`]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /api/puntos-venta/:id — editar ───────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  const { nombre, direccion, telefono, pin, activo } = req.body
  try {
    const setParts = ['nombre=$1','direccion=$2','telefono=$3','activo=$4']
    const values   = [nombre, direccion || null, telefono || null, activo !== false]
    if (pin) { setParts.push(`pin=$${values.length + 1}`); values.push(pin) }
    values.push(req.params.id)

    const { rows } = await db.query(
      `UPDATE puntos_de_venta SET ${setParts.join(',')} WHERE id=$${values.length}
       RETURNING id, nombre, direccion, telefono, activo, created_at`,
      values
    )
    if (!rows.length) return res.status(404).json({ error: 'Punto de venta no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/puntos-venta/:id ──────────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE puntos_de_venta SET activo = FALSE WHERE id=$1 RETURNING nombre',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' })
    res.json({ message: `${rows[0].nombre} desactivado` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/puntos-venta/login — login empleado con PIN ─────
router.post('/login', async (req, res) => {
  const { id, pin } = req.body
  if (!id || !pin) return res.status(400).json({ error: 'ID y PIN requeridos' })
  try {
    const { rows } = await db.query(
      'SELECT * FROM puntos_de_venta WHERE id=$1 AND activo=TRUE', [id]
    )
    const pv = rows[0]
    if (!pv)       return res.status(404).json({ error: 'Punto de venta no encontrado' })
    if (pv.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto' })

    const token = jwt.sign(
      { pv_id: pv.id, pv_nombre: pv.nombre, role: 'empleado' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({ token, puntoVenta: { id: pv.id, nombre: pv.nombre, direccion: pv.direccion } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/puntos-venta/:id/pedidos — pedidos del local ─────
// El admin ve cualquiera; el empleado solo el punto de venta de su token.
router.get('/:id/pedidos', requireStaff, async (req, res) => {
  if (req.user.role === 'empleado' && String(req.user.pv_id) !== String(req.params.id)) {
    return res.status(403).json({ error: 'Solo puedes ver los pedidos de tu punto de venta' })
  }
  try {
    const { rows: pedidos } = await db.query(`
      SELECT p.*, c.name AS cliente_name, c.phone AS cliente_phone
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE p.punto_venta_id = $1
      ORDER BY p.created_at DESC
    `, [req.params.id])

    const { rows: items } = await db.query(`
      SELECT pi.* FROM pedido_items pi
      JOIN pedidos p ON p.id = pi.pedido_id
      WHERE p.punto_venta_id = $1
    `, [req.params.id])

    const result = pedidos.map(p => ({
      ...p,
      customer: { name: p.cliente_name, phone: p.cliente_phone, notes: p.notes },
      items: items.filter(i => i.pedido_id === p.id),
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
