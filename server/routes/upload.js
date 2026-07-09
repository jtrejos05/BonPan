const router     = require('express').Router()
const cloudinary = require('cloudinary').v2
const multer     = require('multer')
const { adminOnly } = require('../middleware/staffAuth')

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Multer en memoria (no guarda en disco)
const storage = multer.memoryStorage()
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  }
})

// POST /api/upload/imagen (admin)
router.post('/imagen', adminOnly, upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })

  try {
    // Subir a Cloudinary desde buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         'bonpan/productos',
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'center' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    res.json({
      url:       result.secure_url,
      public_id: result.public_id,
    })
  } catch (err) {
    console.error('Error Cloudinary:', err)
    res.status(500).json({ error: 'Error al subir la imagen' })
  }
})

// DELETE /api/upload/imagen  — eliminar imagen de Cloudinary (admin)
router.delete('/imagen', adminOnly, async (req, res) => {
  const { public_id } = req.body
  if (!public_id) return res.status(400).json({ error: 'public_id requerido' })
  try {
    await cloudinary.uploader.destroy(public_id)
    res.json({ message: 'Imagen eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
