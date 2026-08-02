const router = require('express').Router()
const db     = require('../db')
const { requireStaff } = require('../middleware/authMiddleware')

// GET /api/clientes — todos los clientes con sus métricas
router.get('/', requireStaff, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        c.id,
        c.name,
        c.phone,
        c.created_at,
        COUNT(p.id)                                         AS total_pedidos,
        COALESCE(SUM(CASE WHEN p.status != 'Cancelado' THEN p.total ELSE 0 END), 0) AS total_gastado,
        COALESCE(AVG(CASE WHEN p.status != 'Cancelado' THEN p.total END), 0)        AS ticket_promedio,
        MAX(p.created_at)                                   AS ultimo_pedido
      FROM clientes c
      LEFT JOIN pedidos p ON p.cliente_id = c.id
      GROUP BY c.id
      ORDER BY total_gastado DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/clientes/:id/pedidos — historial completo de un cliente
router.get('/:id/pedidos', requireStaff, async (req, res) => {
  try {
    const { rows: pedidos } = await db.query(
      `SELECT * FROM pedidos WHERE cliente_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    )
    const { rows: items } = await db.query(
      `SELECT pi.* FROM pedido_items pi
       JOIN pedidos p ON p.id = pi.pedido_id
       WHERE p.cliente_id = $1`,
      [req.params.id]
    )
    const result = pedidos.map(p => ({
      ...p,
      items: items.filter(i => i.pedido_id === p.id),
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
