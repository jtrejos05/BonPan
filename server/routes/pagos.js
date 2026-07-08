const router = require('express').Router()
const crypto = require('crypto')
const db     = require('../db')

// ── Config Wompi ──────────────────────────────────────────────
// Sandbox:    https://sandbox.wompi.co/v1     (llaves pub_test_ / prv_test_)
// Producción: https://production.wompi.co/v1  (llaves pub_prod_ / prv_prod_)
const WOMPI_API = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1'

const ESTADOS_PAGO = {
  APPROVED: 'Aprobado',
  DECLINED: 'Rechazado',
  VOIDED:   'Anulado',
  ERROR:    'Error',
  PENDING:  'Pendiente',
}

// ── POST /api/pagos/firma — datos + firma de integridad para el widget ──
// El secreto de integridad NUNCA sale del servidor: aquí se calcula la
// firma que el widget de Wompi exige para abrir el checkout.
router.post('/firma', async (req, res) => {
  try {
    const { pedidoId, amountInCents } = req.body
    if (!pedidoId || !Number.isInteger(amountInCents) || amountInCents <= 0) {
      return res.status(400).json({ error: 'pedidoId y amountInCents son requeridos' })
    }
    if (!process.env.WOMPI_PUBLIC_KEY || !process.env.WOMPI_INTEGRITY_SECRET) {
      return res.status(500).json({ error: 'Wompi no está configurado en el servidor' })
    }

    // Validar que el monto coincida con el total del pedido (evita manipulación en el cliente)
    const { rows } = await db.query('SELECT id, total FROM pedidos WHERE id = $1', [pedidoId])
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' })
    if (rows[0].total * 100 !== amountInCents) {
      return res.status(400).json({ error: 'El monto no coincide con el pedido' })
    }

    const currency  = 'COP'
    const reference = `BONPAN-${pedidoId}-${Date.now()}`
    const integrity = crypto
      .createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${process.env.WOMPI_INTEGRITY_SECRET}`)
      .digest('hex')

    await db.query(
      `UPDATE pedidos SET payment_reference = $1, payment_status = 'Pendiente' WHERE id = $2`,
      [reference, pedidoId]
    )

    res.json({
      reference,
      amountInCents,
      currency,
      signature: integrity,
      publicKey: process.env.WOMPI_PUBLIC_KEY,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Actualizar pedido según transacción de Wompi ──────────────
async function aplicarTransaccion(tx) {
  const estado = ESTADOS_PAGO[tx.status] || tx.status
  const { rows } = await db.query(
    `UPDATE pedidos
     SET payment_status = $1, wompi_transaction_id = $2, payment_method = $3
     WHERE payment_reference = $4
     RETURNING id`,
    [estado, tx.id, tx.payment_method_type || null, tx.reference]
  )
  if (rows.length) {
    await db.query(
      `INSERT INTO actividad_log (type, description, data) VALUES ($1,$2,$3)`,
      ['pago', `Pago ${estado} — Pedido #${rows[0].id} ($${Math.round(tx.amount_in_cents / 100).toLocaleString('es-CO')})`,
       JSON.stringify({ pedidoId: rows[0].id, transactionId: tx.id, status: tx.status, method: tx.payment_method_type })]
    )
    // Al aprobarse el pago, otorgar los puntos de fidelidad que quedaron
    // pendientes al crear el pedido (una sola vez, aunque el webhook y la
    // verificación lleguen ambos)
    if (estado === 'Aprobado') {
      const { rows: pRows } = await db.query(
        `UPDATE pedidos SET puntos_otorgados = TRUE
         WHERE id = $1 AND usuario_id IS NOT NULL AND puntos_otorgados = FALSE
         RETURNING usuario_id, total`,
        [rows[0].id]
      )
      if (pRows.length) {
        const puntos = Math.floor(Number(pRows[0].total) / 1000)
        if (puntos > 0) {
          await db.query(
            'UPDATE usuarios SET puntos = COALESCE(puntos, 0) + $1 WHERE id = $2',
            [puntos, pRows[0].usuario_id]
          )
        }
      }
    }
  }
  return rows[0]?.id || null
}

// ── POST /api/pagos/webhook — eventos de Wompi ────────────────
// Configurar en el panel de Wompi: URL de eventos → https://<tu-api>/api/pagos/webhook
router.post('/webhook', async (req, res) => {
  try {
    const evento = req.body
    // Eventos que no son de transacciones (ej: nequi_token.updated) se
    // aceptan con 200 y se ignoran, para que Wompi no los reintente
    if (!evento?.data?.transaction) {
      return res.json({ ok: true, ignored: true })
    }
    if (!evento.signature?.checksum) {
      return res.status(400).json({ error: 'Evento inválido' })
    }

    // Verificar checksum: SHA256(valores de signature.properties + timestamp + secreto de eventos)
    if (process.env.WOMPI_EVENTS_SECRET) {
      const concatenado = evento.signature.properties
        .map(prop => prop.split('.').reduce((obj, key) => obj?.[key], evento.data))
        .join('')
      const checksum = crypto
        .createHash('sha256')
        .update(`${concatenado}${evento.timestamp}${process.env.WOMPI_EVENTS_SECRET}`)
        .digest('hex')
      if (checksum !== evento.signature.checksum.toLowerCase()) {
        return res.status(403).json({ error: 'Checksum inválido' })
      }
    } else {
      console.warn('⚠️ WOMPI_EVENTS_SECRET no está configurado: se aceptan eventos sin verificar su firma')
    }

    await aplicarTransaccion(evento.data.transaction)
    res.json({ ok: true })
  } catch (err) {
    console.error('❌ Webhook Wompi:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/pagos/verificar/:transactionId ───────────────────
// Consulta directa a la API de Wompi. Es el respaldo cuando el webhook
// aún no llega (o en desarrollo local, donde Wompi no puede alcanzarnos).
router.get('/verificar/:transactionId', async (req, res) => {
  try {
    const resp = await fetch(`${WOMPI_API}/transactions/${req.params.transactionId}`)
    if (!resp.ok) return res.status(resp.status).json({ error: 'Transacción no encontrada en Wompi' })
    const { data: tx } = await resp.json()

    const pedidoId = await aplicarTransaccion(tx)
    res.json({
      pedidoId,
      transactionId: tx.id,
      status: tx.status,
      statusLabel: ESTADOS_PAGO[tx.status] || tx.status,
      paymentMethod: tx.payment_method_type,
      amountInCents: tx.amount_in_cents,
      reference: tx.reference,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
