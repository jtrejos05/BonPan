const jwt = require('jsonwebtoken')

function verify(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
  } catch {
    return null
  }
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
function pvEmpleado(req, res, next) {
  const user = verify(req)
  if (!user) return res.status(401).json({ error: 'Sesión inválida o expirada' })
  if (user.role === 'admin') { req.user = user; return next() }
  if (user.role === 'empleado' && user.pv_id === Number(req.params.id)) {
    req.user = user
    return next()
  }
  res.status(403).json({ error: 'No tienes acceso a este punto de venta' })
}

// Admin o empleado de cualquier local
function staff(req, res, next) {
  const user = verify(req)
  if (!user || !['admin', 'empleado'].includes(user.role)) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
  req.user = user
  next()
}

module.exports = { adminOnly, pvEmpleado, staff }
