const jwt = require('jsonwebtoken')
const db  = require('../db')
const { fueraDeHorario } = require('../utils/horario')

function verify(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
  } catch {
    return null
  }
}

// Un token de empleado solo sirve mientras su dispositivo siga aprobado,
// el local esté activo y estemos dentro del horario del local. Así, al
// revocar un dispositivo o llegar la hora de cierre, las sesiones activas
// quedan inválidas de inmediato sin intervención del administrador.
async function empleadoAutorizado(user) {
  if (user.role !== 'empleado') return { ok: true }
  if (!user.dispositivo_id) return { ok: false, error: 'El acceso de este dispositivo fue revocado' }
  const { rows } = await db.query(
    `SELECT d.aprobado, pv.activo, pv.hora_apertura, pv.hora_cierre
     FROM pv_dispositivos d
     JOIN puntos_de_venta pv ON pv.id = d.punto_venta_id
     WHERE d.id = $1`,
    [user.dispositivo_id]
  )
  const info = rows[0]
  if (!info || info.aprobado !== true) {
    return { ok: false, error: 'El acceso de este dispositivo fue revocado' }
  }
  if (info.activo === false) {
    return { ok: false, error: 'Este punto de venta está inactivo' }
  }
  if (fueraDeHorario(info)) {
    return {
      ok: false,
      error: `Acceso permitido solo de ${info.hora_apertura} a ${info.hora_cierre} (hora Colombia)`,
    }
  }
  return { ok: true }
}

// Solo administradores
function adminOnly(req, res, next) {
  const user = verify(req)
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Acceso solo para administradores' })
  }
  req.user = user
  next()
}

// Empleado del punto de venta indicado en :id (o un admin)
async function pvEmpleado(req, res, next) {
  const user = verify(req)
  if (!user) return res.status(401).json({ error: 'Sesión inválida o expirada' })
  if (user.role === 'admin') { req.user = user; return next() }
  if (user.role === 'empleado' && user.pv_id === Number(req.params.id)) {
    try {
      const auth = await empleadoAutorizado(user)
      if (!auth.ok) return res.status(401).json({ error: auth.error })
    } catch {
      return res.status(500).json({ error: 'Error verificando el acceso' })
    }
    req.user = user
    return next()
  }
  res.status(403).json({ error: 'No tienes acceso a este punto de venta' })
}

// Admin o empleado de cualquier local
async function staff(req, res, next) {
  const user = verify(req)
  if (!user || !['admin', 'empleado'].includes(user.role)) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
  try {
    const auth = await empleadoAutorizado(user)
    if (!auth.ok) return res.status(401).json({ error: auth.error })
  } catch {
    return res.status(500).json({ error: 'Error verificando el acceso' })
  }
  req.user = user
  next()
}

module.exports = { adminOnly, pvEmpleado, staff }
