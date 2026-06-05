const { Pool } = require('pg')
require('dotenv').config()

// Railway provee DATABASE_URL automáticamente cuando hay PostgreSQL
// En local usamos las variables individuales del .env
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    })

pool.on('connect', () => console.log('✅ Conectado a PostgreSQL'))
pool.on('error',   (err) => console.error('❌ Error en PostgreSQL:', err))

module.exports = pool
