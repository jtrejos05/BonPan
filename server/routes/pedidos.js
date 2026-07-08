const router = require('express').Router()
const db     = require('../db')
const { adminOnly, staff } = require('../middleware/staffAuth')
const { expirarPagosPendientes } = require('../utils/pagosPendientes')

// GET /api/pedidos (admin)
// Los pedidos con pago en línea iniciado pero no aprobado aún no se muestran:
// entran a los paneles solo cuando Wompi confirma el pago.
router.get('/', adminOnly, async (req, res) => {
  try {
    await expirarPagosPendientes()
    // Pedidos con datos del cliente
    const { rows: pedidos } = await db.query(`
      SELECT p.*, c.name AS cliente_name, c.phone AS cliente_phone
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE (p.payment_status IS NULL OR p.payment_status = 'Aprobado')
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

// GET /api/pedidos/:id (admin)
router.get('/:id', adminOnly, async (req, res) => {
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
  const { customer, items, total, usuarioId } = req.body
  // Con pago en línea, el pedido queda oculto de los paneles hasta que
  // Wompi apruebe la transacción (ver filtros en los GET y pagos.js)
  const pagoEnLinea = customer?.metodoPago === 'wompi'
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

    // Crear pedido — los retiros van al local que eligió el cliente; los
    // domicilios (sin local) se asignan al local que recibe los domicilios
    const d = customer.delivery || {}
    let puntoVentaId = d.puntoVentaId || null
    if (!puntoVentaId) {
      const { rows: pvRows } = await client.query(
        `SELECT id FROM puntos_de_venta WHERE activo = TRUE
         ORDER BY recibe_domicilios DESC, id LIMIT 1`
      )
      puntoVentaId = pvRows[0]?.id || null
    }
    const { rows: pRows } = await client.query(
      `INSERT INTO pedidos (cliente_id, total, status, notes, punto_venta_id,
                            tipo_entrega, ciudad_entrega, zona_entrega, direccion_entrega, costo_domicilio,
                            usuario_id, payment_status)
       VALUES ($1,$2,'Pendiente',$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [clienteId, total, customer.notes || null, puntoVentaId,
       d.tipo || null, d.ciudad || null, d.zona || null, d.direccion || null,
       Number(d.costoDomicilio) || 0,
       usuarioId || null, pagoEnLinea ? 'Pendiente' : null]
    )
    const pedidoId = pRows[0].id

    // Insertar items — las promos usan ids tipo "promo-5" que no existen
    // en productos, así que solo se guarda producto_id cuando es numérico
    for (const item of items) {
      const idNum = Number(item.id)
      const productoId = Number.isInteger(idNum) && idNum > 0 ? idNum : null
      await client.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, name, emoji, price, qty)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [pedidoId, productoId, item.name, item.emoji, item.price, item.qty]
      )
    }

    // Historial inicial
    await client.query(
      `INSERT INTO pedido_estado_historial (pedido_id, status) VALUES ($1,'Pendiente')`,
      [pedidoId]
    )

    // Guardar el teléfono en la cuenta del usuario si aún no tiene uno
    if (usuarioId && customer.phone) {
      await client.query(
        `UPDATE usuarios SET phone = $1 WHERE id = $2 AND (phone IS NULL OR phone = '')`,
        [customer.phone.trim(), usuarioId]
      )
    }

    // Sumar puntos al usuario registrado (1 punto por $1.000).
    // Con pago en línea, los puntos se otorgan cuando Wompi aprueba el pago.
    if (usuarioId && !pagoEnLinea) {
      const puntosGanados = Math.floor(total / 1000)
      if (puntosGanados > 0) {
        await client.query(
          'UPDATE usuarios SET puntos = COALESCE(puntos, 0) + $1 WHERE id = $2',
          [puntosGanados, usuarioId]
        )
      }
      await client.query(
        'UPDATE pedidos SET puntos_otorgados = TRUE WHERE id = $1', [pedidoId]
      )
    }

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

// PUT /api/pedidos/:id/estado  — cambiar estado (admin o empleado del local)
router.put('/:id/estado', staff, async (req, res) => {
  const { status } = req.body
  const VALID = ['Pendiente','En preparación','Listo','Entregado','Cancelado']
  if (!VALID.includes(status)) return res.status(400).json({ error: 'Estado inválido' })

  try {
    // Un empleado solo puede cambiar pedidos de su propio local
    if (req.user.role === 'empleado') {
      const { rows: pRows } = await db.query(
        'SELECT punto_venta_id FROM pedidos WHERE id=$1', [req.params.id]
      )
      if (!pRows.length) return res.status(404).json({ error: 'Pedido no encontrado' })
      if (pRows[0].punto_venta_id !== req.user.pv_id) {
        return res.status(403).json({ error: 'Este pedido no pertenece a tu local' })
      }
    }

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
