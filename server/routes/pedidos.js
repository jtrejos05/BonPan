const router = require('express').Router()
const db     = require('../db')
const { requireStaff } = require('../middleware/authMiddleware')

// GET /api/pedidos
router.get('/', requireStaff, async (req, res) => {
  try {
    // Pedidos con datos del cliente
    const { rows: pedidos } = await db.query(`
      SELECT p.*, c.name AS cliente_name, c.phone AS cliente_phone
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      ORDER BY p.created_at DESC
    `)

    // Items de cada pedido
    const { rows: items } = await db.query('SELECT * FROM pedido_items ORDER BY pedido_id')

    // Historial de estados
    const { rows: historial } = await db.query(
      'SELECT * FROM pedido_estado_historial ORDER BY changed_at ASC'
    )

    // Unir todo
    const result = pedidos.map(p => ({
      ...p,
      customer: { name: p.cliente_name, phone: p.cliente_phone, notes: p.notes },
      items: items.filter(i => i.pedido_id === p.id),
      statusHistory: historial
        .filter(h => h.pedido_id === p.id)
        .map(h => ({ status: h.status, timestamp: h.changed_at })),
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/pedidos/:id
router.get('/:id', requireStaff, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, c.name AS cliente_name, c.phone AS cliente_phone
      FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = $1`, [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' })

    const { rows: items }    = await db.query('SELECT * FROM pedido_items WHERE pedido_id=$1', [req.params.id])
    const { rows: historial } = await db.query(
      'SELECT * FROM pedido_estado_historial WHERE pedido_id=$1 ORDER BY changed_at', [req.params.id])

    const pedido = {
      ...rows[0],
      customer: { name: rows[0].cliente_name, phone: rows[0].cliente_phone, notes: rows[0].notes },
      items,
      statusHistory: historial.map(h => ({ status: h.status, timestamp: h.changed_at })),
    }
    res.json(pedido)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/pedidos  — crear pedido completo
router.post('/', async (req, res) => {
  const { customer, items, total } = req.body
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // Upsert cliente por teléfono
    const { rows: cRows } = await client.query(
      `INSERT INTO clientes (name, phone)
       VALUES ($1,$2)
       ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [customer.name, customer.phone]
    )
    const clienteId = cRows[0].id

    // Crear pedido
    const { rows: pRows } = await client.query(
      `INSERT INTO pedidos (cliente_id, total, status, notes, punto_venta_id)
       VALUES ($1,$2,'Pendiente',$3,$4) RETURNING *`,
      [clienteId, total, customer.notes || null, customer.delivery?.puntoVentaId || null]
    )
    const pedidoId = pRows[0].id

    // Insertar items
    for (const item of items) {
      await client.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, name, emoji, price, qty)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [pedidoId, item.id, item.name, item.emoji, item.price, item.qty]
      )
    }

    // Historial inicial
    await client.query(
      `INSERT INTO pedido_estado_historial (pedido_id, status) VALUES ($1,'Pendiente')`,
      [pedidoId]
    )

    // Log actividad
    await client.query(
      `INSERT INTO actividad_log (type, description, data) VALUES ($1,$2,$3)`,
      ['pedido', `Nuevo pedido de ${customer.name} — $${total.toLocaleString()}`,
       JSON.stringify({ pedidoId, customer, total })]
    )

    await client.query('COMMIT')

    res.status(201).json({ id: pedidoId, ...pRows[0], customer, items })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PUT /api/pedidos/:id/estado  — cambiar estado
router.put('/:id/estado', requireStaff, async (req, res) => {
  const { status } = req.body
  const VALID = ['Pendiente','En preparación','Listo','Entregado','Cancelado']
  if (!VALID.includes(status)) return res.status(400).json({ error: 'Estado inválido' })

  try {
    const { rows } = await db.query(
      'UPDATE pedidos SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' })

    await db.query(
      'INSERT INTO pedido_estado_historial (pedido_id, status) VALUES ($1,$2)',
      [req.params.id, status]
    )
    await db.query(
      `INSERT INTO actividad_log (type, description, data) VALUES ($1,$2,$3)`,
      ['estado', `Pedido #${req.params.id} → ${status}`, JSON.stringify({ pedidoId: req.params.id, status })]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
