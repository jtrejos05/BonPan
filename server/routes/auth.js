const router = require('express').Router()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body
  console.log('Login attempt:', { username, hasPassword: !!password })
  console.log('Env vars:', { ADMIN_USERNAME: process.env.ADMIN_USERNAME, hasPassword: !!process.env.ADMIN_PASSWORD })
  const validUser = username === process.env.ADMIN_USERNAME
  const validPass = password === process.env.ADMIN_PASSWORD
  if (validUser && validPass) {
    res.json({ ok: true, message: 'Autenticado correctamente' })
  } else {
    res.status(401).json({ ok: false, message: 'Usuario o contraseña incorrectos' })
  }
})

module.exports = router
