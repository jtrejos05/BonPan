const router = require('express').Router()
const crypto = require('crypto')
const jwt    = require('jsonwebtoken')

// Comparación en tiempo constante para no filtrar la contraseña por timing
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''))
  const bufB = Buffer.from(String(b ?? ''))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// POST /api/auth/login — acceso al panel administrativo
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    console.error('❌ Faltan ADMIN_USERNAME, ADMIN_PASSWORD o JWT_SECRET en el entorno')
    return res.status(500).json({ error: 'Servidor mal configurado' })
  }

  const validUser = safeEqual(username, process.env.ADMIN_USERNAME)
  const validPass = safeEqual(password, process.env.ADMIN_PASSWORD)

  if (!validUser || !validPass) {
    return res.status(401).json({ ok: false, message: 'Usuario o contraseña incorrectos' })
  }

  const token = jwt.sign(
    { role: 'admin', username: process.env.ADMIN_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  )
  res.json({ ok: true, token, message: 'Autenticado correctamente' })
})

module.exports = router
