const router  = require('express').Router()
const db      = require('../db')
const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// ── POST /api/usuarios/register ───────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' })
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

  try {
    const exists = await db.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (exists.rows.length)
      return res.status(409).json({ error: 'Ya existe una cuenta con este correo' })

    const hash = await bcrypt.hash(password, 12)
    const { rows } = await db.query(
      `INSERT INTO usuarios (name, email, password)
       VALUES ($1, $2, $3) RETURNING id, name, email, avatar, created_at`,
      [name.trim(), email.toLowerCase().trim(), hash]
    )
    const user = rows[0]
    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1, $2)`,
      ['sistema', `Nuevo registro: ${user.email}`]
    )
    res.status(201).json({ token: generateToken(user), user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/usuarios/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Correo y contraseña requeridos' })

  try {
    const { rows } = await db.query(
      'SELECT * FROM usuarios WHERE email = $1', [email.toLowerCase().trim()]
    )
    const user = rows[0]
    if (!user)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' })
    if (!user.password)
      return res.status(401).json({ error: 'Esta cuenta fue creada con Google. Usa "Continuar con Google".' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' })

    await db.query(
      `INSERT INTO actividad_log (type, description) VALUES ($1, $2)`,
      ['sistema', `Inicio de sesión: ${user.email}`]
    )
    const { password: _, ...safeUser } = user
    res.json({ token: generateToken(safeUser), user: safeUser })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/usuarios/google ─────────────────────────────────
router.post('/google', async (req, res) => {
  const { credential } = req.body
  if (!credential) return res.status(400).json({ error: 'Token de Google requerido' })

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    // Buscar usuario existente
    let { rows } = await db.query(
      'SELECT * FROM usuarios WHERE google_id = $1 OR email = $2',
      [googleId, email]
    )

    let user = rows[0]
    if (!user) {
      // Crear nuevo usuario
      const result = await db.query(
        `INSERT INTO usuarios (name, email, google_id, avatar)
         VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar, created_at`,
        [name, email, googleId, picture]
      )
      user = result.rows[0]
      await db.query(
        `INSERT INTO actividad_log (type, description) VALUES ($1, $2)`,
        ['sistema', `Nuevo registro con Google: ${email}`]
      )
    } else if (!user.google_id) {
      // Vincular Google a cuenta existente
      await db.query(
        'UPDATE usuarios SET google_id=$1, avatar=$2 WHERE id=$3',
        [googleId, picture, user.id]
      )
      user.google_id = googleId
      user.avatar    = picture
    }

    const { password: _, ...safeUser } = user
    res.json({ token: generateToken(safeUser), user: safeUser })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(401).json({ error: 'Token de Google inválido' })
  }
})

// ── GET /api/usuarios/me ──────────────────────────────────────
router.get('/me', require('../middleware/authMiddleware'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, avatar, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
