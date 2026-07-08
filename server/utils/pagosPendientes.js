const db = require('../db')

// Cancela pedidos cuyo pago en línea quedó iniciado pero nunca se aprobó
// (cliente cerró el widget de Wompi, se le venció la sesión, etc.).
// Se invoca al listar pedidos, así no requiere ningún proceso aparte.
async function expirarPagosPendientes() {
  const limite = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 horas
  try {
    await db.query(
      `UPDATE pedidos SET status = 'Cancelado', payment_status = 'Expirado'
       WHERE payment_status = 'Pendiente' AND created_at < $1`,
      [limite]
    )
  } catch (e) {
    console.error('⚠️ No se pudieron expirar pagos pendientes:', e.message)
  }
}

module.exports = { expirarPagosPendientes }
