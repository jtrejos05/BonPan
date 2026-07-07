const jwt = require('jsonwebtoken')
const db  = require('../db')

function verify(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
  } catch {
    return null
  }
}

// Un token de empleado solo sirve mientras su dispositivo siga aprobado:
// al revocar el dispositivo, la sesión activa queda inválida de inmediato.
async function dispositivoSigueAprobado(user) {
  if (user.role !== 'empleado') return true
  if (!user.dispositivo_id) return false
  const { rows } = await db.query(
    'SELECT aprobado FROM pv_dispositivos WHERE id=$1', [user.dispositivo_id]
  )
  return rows.length > 0 && rows[0].aprobado === true
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
      if (!await dispositivoSigueAprobado(user)) {
        return res.status(401).json({ error: 'El acceso de este dispositivo fue revocado' })
      }
    } catch {
      return res.status(500).json({ error: 'Error verificando el dispositivo' })
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
    if (!await dispositivoSigueAprobado(user)) {
      return res.status(401).json({ error: 'El acceso de este dispositivo fue revocado' })
    }
  } catch {
    return res.status(500).json({ error: 'Error verificando el dispositivo' })
  }
  req.user = user
  next()
}

module.exports = { adminOnly, pvEmpleado, staff }
