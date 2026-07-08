const router = require('express').Router()
const db     = require('../db')
const jwt    = require('jsonwebtoken')
const { adminOnly, pvEmpleado } = require('../middleware/staffAuth')
const { fueraDeHorario } = require('../utils/horario')

// ── Helpers de seguridad ──────────────────────────────────────
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket.remoteAddress || ''
}

async function logAcceso(req, { pvId = null, dispositivoId = null, exito, motivo }) {
  try {
    await db.query(
      `INSERT INTO pv_accesos (punto_venta_id, dispositivo_id, exito, motivo, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [pvId, dispositivoId, exito, motivo, clientIp(req), req.headers['user-agent'] || null]
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

// ── GET /api/puntos-venta/dispositivos — dispositivos registrados (admin) ──
router.get('/dispositivos', adminOnly, async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT d.id, d.punto_venta_id, d.nombre, d.aprobado, d.created_at, d.last_used_at,
             pv.nombre AS pv_nombre
      FROM pv_dispositivos d
      JOIN puntos_de_venta pv ON pv.id = d.punto_venta_id
      ORDER BY d.aprobado ASC, d.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/puntos-venta/dispositivos/:id/aprobar — aprobar/revocar (admin) ──
router.patch('/dispositivos/:id/aprobar', adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE pv_dispositivos SET aprobado = NOT aprobado WHERE id=$1
       RETURNING id, punto_venta_id, nombre, aprobado`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Dispositivo no encontrado' })
    const d = rows[0]
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
      ['sistema', `Dispositivo ${d.aprobado ? 'aprobado' : 'revocado'}: ${d.nombre || `#${d.id}`}`]
    )
    res.json(d)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/puntos-venta/dispositivos/:id — eliminar dispositivo (admin) ──
router.delete('/dispositivos/:id', adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM pv_dispositivos WHERE id=$1 RETURNING nombre', [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Dispositivo no encontrado' })
    res.json({ message: `Dispositivo eliminado` })
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
             pv.nombre AS pv_nombre, d.nombre AS dispositivo_nombre
      FROM pv_accesos a
      LEFT JOIN puntos_de_venta pv ON pv.id = a.punto_venta_id
      LEFT JOIN pv_dispositivos d  ON d.id  = a.dispositivo_id
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
  const { nombre, direccion, telefono, pin, hora_apertura, hora_cierre } = req.body
  if (!nombre || !pin) return res.status(400).json({ error: 'Nombre y PIN son requeridos' })
  if (pin.length < 4)  return res.status(400).json({ error: 'El PIN debe tener al menos 4 dígitos' })
  try {
    const { rows } = await db.query(
      `INSERT INTO puntos_de_venta (nombre, direccion, telefono, pin, hora_apertura, hora_cierre)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, nombre, direccion, telefono, activo, hora_apertura, hora_cierre, created_at`,
      [nombre, direccion || null, telefono || null, pin, hora_apertura || null, hora_cierre || null]
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
  const { nombre, direccion, telefono, pin, activo, hora_apertura, hora_cierre } = req.body
  try {
    const setParts = ['nombre=$1','direccion=$2','telefono=$3','activo=$4','hora_apertura=$5','hora_cierre=$6']
    const values   = [nombre, direccion || null, telefono || null, activo !== false,
                      hora_apertura || null, hora_cierre || null]
    if (pin) { setParts.push(`pin=$${values.length + 1}`); values.push(pin) }
    values.push(req.params.id)

    const { rows } = await db.query(
      `UPDATE puntos_de_venta SET ${setParts.join(',')} WHERE id=$${values.length}
       RETURNING id, nombre, direccion, telefono, activo, hora_apertura, hora_cierre, created_at`,
      values
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

// ── POST /api/puntos-venta/login — login empleado con PIN ─────
// Requiere: PIN correcto + horario permitido + dispositivo aprobado
router.post('/login', async (req, res) => {
  const { id, pin, deviceToken, deviceName } = req.body
  if (!id || !pin) return res.status(400).json({ error: 'ID y PIN requeridos' })
  try {
    const { rows } = await db.query(
      'SELECT * FROM puntos_de_venta WHERE id=$1 AND activo=TRUE', [id]
    )
    const pv = rows[0]
    if (!pv) return res.status(404).json({ error: 'Punto de venta no encontrado' })

    if (pv.pin !== pin) {
      await logAcceso(req, { pvId: pv.id, exito: false, motivo: 'PIN incorrecto' })
      return res.status(401).json({ error: 'PIN incorrecto' })
    }

    if (fueraDeHorario(pv)) {
      await logAcceso(req, { pvId: pv.id, exito: false, motivo: 'Fuera de horario' })
      return res.status(403).json({
        error: `Acceso permitido solo de ${pv.hora_apertura} a ${pv.hora_cierre} (hora Colombia)`,
      })
    }

    if (!deviceToken) {
      await logAcceso(req, { pvId: pv.id, exito: false, motivo: 'Dispositivo no identificado' })
      return res.status(403).json({ error: 'Dispositivo no identificado. Actualiza la página e intenta de nuevo.' })
    }

    // Buscar o registrar el dispositivo
    const { rows: dRows } = await db.query(
      'SELECT * FROM pv_dispositivos WHERE device_token=$1 AND punto_venta_id=$2',
      [deviceToken, pv.id]
    )
    let dispositivo = dRows[0]

    if (!dispositivo) {
      const nombre = (deviceName || 'Dispositivo sin nombre').slice(0, 150)
      const { rows: nRows } = await db.query(
        `INSERT INTO pv_dispositivos (punto_venta_id, nombre, device_token)
         VALUES ($1,$2,$3) RETURNING *`,
        [pv.id, nombre, deviceToken]
      )
      dispositivo = nRows[0]
      await db.query(
        `INSERT INTO actividad_log (type, description) VALUES ($1,$2)`,
        ['sistema', `Nuevo dispositivo pendiente de aprobación en ${pv.nombre}: ${nombre}`]
      )
    }

    if (!dispositivo.aprobado) {
      await logAcceso(req, {
        pvId: pv.id, dispositivoId: dispositivo.id,
        exito: false, motivo: 'Dispositivo no aprobado',
      })
      return res.status(403).json({
        error: 'Este dispositivo no está autorizado para este local.',
        pendingDevice: true,
        dispositivo: { id: dispositivo.id, nombre: dispositivo.nombre },
      })
    }

    await db.query('UPDATE pv_dispositivos SET last_used_at = NOW() WHERE id=$1', [dispositivo.id])
    await logAcceso(req, {
      pvId: pv.id, dispositivoId: dispositivo.id, exito: true, motivo: 'Ingreso exitoso',
    })

    const token = jwt.sign(
      { pv_id: pv.id, pv_nombre: pv.nombre, dispositivo_id: dispositivo.id, role: 'empleado' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    )
    res.json({ token, puntoVenta: { id: pv.id, nombre: pv.nombre, direccion: pv.direccion } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/puntos-venta/:id/pedidos — pedidos del local (empleado del local o admin) ──
router.get('/:id/pedidos', pvEmpleado, async (req, res) => {
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
