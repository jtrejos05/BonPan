const router = require('express').Router()
const jwt    = require('jsonwebtoken')

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body
  const validUser = username === process.env.ADMIN_USERNAME
  const validPass = password === process.env.ADMIN_PASSWORD
  if (validUser && validPass) {
    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '12h' })
    res.json({ ok: true, token, message: 'Autenticado correctamente' })
  } else {
    res.status(401).json({ ok: false, message: 'Usuario o contraseña incorrectos' })
  }
})

module.exports = router
