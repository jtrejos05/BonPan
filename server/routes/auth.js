const router = require('express').Router()
require('dotenv').config()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { password } = req.body
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ ok: true, message: 'Autenticado correctamente' })
  } else {
    res.status(401).json({ ok: false, message: 'Contraseña incorrecta' })
  }
})

module.exports = router
