const router = require('express').Router()
const db     = require('../db')
const jwt    = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { adminOnly, pvEmpleado } = require('../middleware/staffAuth')
const { fueraDeHorario } = require('../utils/horario')
const { expirarPagosPendientes } = require('../utils/pagosPendientes')

// ── Helpers de seguridad ──────────────────────────────────────
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket.remoteAddress || ''
}

async function logAcceso(req, { pvId = null, empleadoId = null, exito, motivo }) {
  try {
    await db.query(
      `INSERT INTO pv_accesos (punto_venta_id, empleado_id, exito, motivo, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [pvId, empleadoId, exito, motivo, clientIp(req), req.headers['user-agent'] || null]
    )
  } catch (e) {
    console.error('⚠️ No se pudo registrar el acceso:', e.message)
  }
}

// ── GET /api/puntos-venta — listar todos (público: selector de local) ──
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, nombre, direccion, telefono, activo, hora_apertura, hora_cierre,
              recibe_domicilios, created_at
       FROM puntos_de_venta ORDER BY id`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/puntos-venta/empleados — empleados registrados (admin) ──
router.get('/empleados', adminOnly, async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT e.id, e.punto_venta_id, e.nombre, e.usuario, e.activo, e.created_at,
             pv.nombre AS pv_nombre
      FROM pv_empleados e
      JOIN puntos_de_venta pv ON pv.id = e.punto_venta_id
      ORDER BY e.activo DESC, e.nombre
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/puntos-venta/empleados — crear empleado (admin) ──
router.post('/empleados', adminOnly, async (req, res) => {
  const { punto_venta_id, nombre, usuario, password } = req.body
  if (!punto_venta_id || !nombre?.trim() || !usuario?.trim() || !password) {
    return res.status(400).json({ error: 'Local, nombre, usuario y contraseña son requeridos' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }
  try {
    const hash = await bcrypt.hash(password, 12)
    const { rows } = await db.query(
      `INSERT INTO pv_empleados (punto_venta_id, nombre, usuario, password_hash)
       VALUES ($1,$2,$3,$4) RETURNING id, punto_venta_id, nombre, usuario, activo, created_at`,
      [punto_venta_id, nombre.trim(), usuario.trim().toLowerCase(), hash]
    )
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['sistema', `Empleado creado: ${nombre.trim()} (${usuario.trim().toLowerCase()})`]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505' || /unique/i.test(err.message)) {
      return res.status(409).json({ error: 'Ese usuario ya existe, elige otro' })
    }
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /api/puntos-venta/empleados/:id — editar empleado (admin) ──
router.put('/empleados/:id', adminOnly, async (req, res) => {
  const { punto_venta_id, nombre, usuario, password, activo } = req.body
  if (!punto_venta_id || !nombre?.trim() || !usuario?.trim()) {
    return res.status(400).json({ error: 'Local, nombre y usuario son requeridos' })
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }
  try {
    const setParts = ['punto_venta_id=$1', 'nombre=$2', 'usuario=$3', 'activo=$4']
    const values   = [punto_venta_id, nombre.trim(), usuario.trim().toLowerCase(), activo !== false]
    if (password) {
      setParts.push(`password_hash=$${values.length + 1}`)
      values.push(await bcrypt.hash(password, 12))
    }
    values.push(req.params.id)
    const { rows } = await db.query(
      `UPDATE pv_empleados SET ${setParts.join(',')} WHERE id=$${values.length}
       RETURNING id, punto_venta_id, nombre, usuario, activo, created_at`,
      values
    )
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado' })
    res.json(rows[0])
  } catch (err) {
    if (err.code === '23505' || /unique/i.test(err.message)) {
      return res.status(409).json({ error: 'Ese usuario ya existe, elige otro' })
    }
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/puntos-venta/empleados/:id/toggle — activar/desactivar (admin) ──
// Al desactivar, la sesión activa del empleado queda inválida de inmediato
router.patch('/empleados/:id/toggle', adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE pv_empleados SET activo = NOT activo WHERE id=$1
       RETURNING id, nombre, usuario, activo`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado' })
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['sistema', `Empleado ${rows[0].activo ? 'activado' : 'desactivado'}: ${rows[0].nombre}`]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/puntos-venta/empleados/:id — eliminar empleado (admin) ──
router.delete('/empleados/:id', adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM pv_empleados WHERE id=$1 RETURNING nombre', [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado' })
    res.json({ message: `${rows[0].nombre} eliminado` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/puntos-venta/accesos — registro de accesos (admin) ──
router.get('/accesos', adminOnly, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 300)
  try {
    const { rows } = await db.query(`
      SELECT a.id, a.exito, a.motivo, a.ip, a.created_at,
             pv.nombre AS pv_nombre, e.nombre AS empleado_nombre
      FROM pv_accesos a
      LEFT JOIN puntos_de_venta pv ON pv.id = a.punto_venta_id
      LEFT JOIN pv_empleados e     ON e.id  = a.empleado_id
      ORDER BY a.created_at DESC
      LIMIT $1
    `, [limit])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/puntos-venta — crear punto de venta (admin) ─────
router.post('/', adminOnly, async (req, res) => {
  const { nombre, direccion, telefono, hora_apertura, hora_cierre } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' })
  try {
    const { rows } = await db.query(
      `INSERT INTO puntos_de_venta (nombre, direccion, telefono, hora_apertura, hora_cierre)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, nombre, direccion, telefono, activo, hora_apertura, hora_cierre, created_at`,
      [nombre, direccion || null, telefono || null, hora_apertura || null, hora_cierre || null]
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

// ── PUT /api/puntos-venta/:id — editar (admin) ───────────────
router.put('/:id', adminOnly, async (req, res) => {
  const { nombre, direccion, telefono, activo, hora_apertura, hora_cierre } = req.body
  try {
    const { rows } = await db.query(
      `UPDATE puntos_de_venta
       SET nombre=$1, direccion=$2, telefono=$3, activo=$4, hora_apertura=$5, hora_cierre=$6
       WHERE id=$7
       RETURNING id, nombre, direccion, telefono, activo, hora_apertura, hora_cierre, created_at`,
      [nombre, direccion || null, telefono || null, activo !== false,
       hora_apertura || null, hora_cierre || null, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Punto de venta no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/puntos-venta/:id/domicilios — este local recibe los domicilios (admin) ──
router.patch('/:id/domicilios', adminOnly, async (req, res) => {
  try {
    await db.query('UPDATE puntos_de_venta SET recibe_domicilios = FALSE')
    const { rows } = await db.query(
      `UPDATE puntos_de_venta SET recibe_domicilios = TRUE
       WHERE id=$1 AND activo=TRUE RETURNING id, nombre`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Punto de venta no encontrado o inactivo' })
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['sistema', `Los pedidos a domicilio ahora llegan a: ${rows[0].nombre}`]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/puntos-venta/:id — desactivar (admin) ────────
router.delete('/:id', adminOnly, async (req, res) => {
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

// ── POST /api/puntos-venta/login — login de empleado ──────────
// Usuario y contraseña propios + horario del local
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body
  if (!usuario || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  try {
    const { rows } = await db.query(`
      SELECT e.*, pv.nombre AS pv_nombre, pv.direccion AS pv_direccion,
             pv.activo AS pv_activo, pv.hora_apertura, pv.hora_cierre
      FROM pv_empleados e
      JOIN puntos_de_venta pv ON pv.id = e.punto_venta_id
      WHERE e.usuario = $1
    `, [String(usuario).trim().toLowerCase()])
    const emp = rows[0]

    if (!emp) {
      await logAcceso(req, { exito: false, motivo: `Usuario no existe: ${String(usuario).slice(0, 30)}` })
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }
    const passOk = await bcrypt.compare(password, emp.password_hash)
    if (!passOk) {
      await logAcceso(req, { pvId: emp.punto_venta_id, empleadoId: emp.id, exito: false, motivo: 'Contraseña incorrecta' })
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }
    if (emp.activo === false || emp.pv_activo === false) {
      await logAcceso(req, { pvId: emp.punto_venta_id, empleadoId: emp.id, exito: false, motivo: 'Empleado o local inactivo' })
      return res.status(401).json({ error: 'Tu acceso está desactivado. Habla con el administrador.' })
    }
    if (fueraDeHorario(emp)) {
      await logAcceso(req, { pvId: emp.punto_venta_id, empleadoId: emp.id, exito: false, motivo: 'Fuera de horario' })
      return res.status(403).json({
        error: `Acceso permitido solo de ${emp.hora_apertura} a ${emp.hora_cierre} (hora Colombia)`,
      })
    }

    await logAcceso(req, { pvId: emp.punto_venta_id, empleadoId: emp.id, exito: true, motivo: 'Ingreso exitoso' })
    const token = jwt.sign(
      { pv_id: emp.punto_venta_id, pv_nombre: emp.pv_nombre,
        empleado_id: emp.id, empleado_nombre: emp.nombre, role: 'empleado' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    )
    res.json({
      token,
      puntoVenta: { id: emp.punto_venta_id, nombre: emp.pv_nombre, direccion: emp.pv_direccion },
      empleado:   { id: emp.id, nombre: emp.nombre },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/puntos-venta/:id/pedidos — pedidos del local (empleado del local o admin) ──
// Los pedidos con pago en línea aparecen solo cuando Wompi aprueba la transacción.
router.get('/:id/pedidos', pvEmpleado, async (req, res) => {
  try {
    await expirarPagosPendientes()
    const { rows: pedidos } = await db.query(`
      SELECT p.*, c.name AS cliente_name, c.phone AS cliente_phone
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE p.punto_venta_id = $1
        AND (p.payment_status IS NULL OR p.payment_status = 'Aprobado')
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
