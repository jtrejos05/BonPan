// ── Widget de Wompi (Web Checkout) ───────────────────────────
// Carga https://checkout.wompi.co/widget.js bajo demanda y abre el
// checkout. La firma de integridad viene del backend (/api/pagos/firma).

let scriptPromise = null

function loadWidgetScript() {
  if (window.WidgetCheckout) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.wompi.co/widget.js'
      s.onload = resolve
      s.onerror = () => {
        scriptPromise = null
        reject(new Error('No se pudo cargar el widget de Wompi'))
      }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

/**
 * Abre el checkout de Wompi. Resuelve con la transacción cuando el
 * usuario completa el pago. Si cierra el widget sin pagar, la promesa
 * no se resuelve (el pedido queda con pago "Pendiente").
 */
export async function openWompiCheckout({ reference, amountInCents, currency, signature, publicKey, customerData }) {
  await loadWidgetScript()
  return new Promise(resolve => {
    const checkout = new window.WidgetCheckout({
      currency,
      amountInCents,
      reference,
      publicKey,
      signature: { integrity: signature },
      ...(customerData ? { customerData } : {}),
    })
    checkout.open(result => resolve(result.transaction))
  })
}
