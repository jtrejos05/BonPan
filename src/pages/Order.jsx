import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart, X, MapPin, Store, ChevronDown, Tag, Check, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { openWompiCheckout } from '../services/wompi'

// ── Modal de tipo de entrega ─────────────────────────────────
function DeliveryModal({ onClose, onConfirm }) {
  const [tipo,       setTipo]       = useState('retiro')
  const [zonaId,     setZonaId]     = useState('')
  const [zonas,      setZonas]      = useState([])
  const [direccion,  setDireccion]  = useState('')
  const [locales,    setLocales]    = useState([])
  const [localId,    setLocalId]    = useState('')
  const [loadingPV,  setLoadingPV]  = useState(true)

  useEffect(() => {
    api.puntosVenta.getAll()
      .then(data => {
        const activos = data.filter(l => l.activo)
        setLocales(activos)
        if (activos.length > 0) setLocalId(String(activos[0].id))
      })
      .catch(() => {})
      .finally(() => setLoadingPV(false))
    api.zonas.getActivas()
      .then(setZonas)
      .catch(() => {})
  }, [])

  const localSeleccionado = locales.find(l => String(l.id) === localId)
  const zonaSeleccionada  = zonas.find(z => String(z.id) === zonaId)

  function confirm() {
    if (tipo === 'domicilio' && (!zonaSeleccionada || !direccion.trim())) return
    if (tipo === 'retiro'   && !localId) return
    onConfirm({
      tipo,
      ciudad:         tipo === 'domicilio' ? zonaSeleccionada.ciudad : '',
      zona:           tipo === 'domicilio' ? zonaSeleccionada.nombre : null,
      costoDomicilio: tipo === 'domicilio' ? Number(zonaSeleccionada.costo) : 0,
      direccion,
      puntoVentaId:        tipo === 'retiro' ? Number(localId) : null,
      puntoVentaNombre:    tipo === 'retiro' ? localSeleccionado?.nombre : null,
      puntoVentaDireccion: tipo === 'retiro' ? localSeleccionado?.direccion : null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — full bottom sheet en móvil, centrado en desktop */}
      <div className="relative bg-white w-full sm:max-w-md shadow-2xl z-10 rounded-t-2xl sm:rounded-none">
        {/* Handle móvil */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-stone-100">
          <h2 className="text-xl sm:text-2xl text-red-950" style={{fontFamily:'Elms Sans, sans-serif'}}>
            ¿Cómo quieres tu pedido?
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors mt-1 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Toggle Domicilio / Retiro */}
          <div className="grid grid-cols-2 border border-stone-200 overflow-hidden">
            <button
              onClick={() => setTipo('domicilio')}
              style={{fontFamily:'Elms Sans, sans-serif'}}
              className={`py-3 text-sm font-bold tracking-wide transition-all duration-200
                ${tipo === 'domicilio'
                  ? 'bg-red-950 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
              🛵 Domicilio
            </button>
            <button
              onClick={() => setTipo('retiro')}
              style={{fontFamily:'Elms Sans, sans-serif'}}
              className={`py-3 text-sm font-bold tracking-wide transition-all duration-200 border-l border-stone-200
                ${tipo === 'retiro'
                  ? 'bg-red-950 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
              🏪 Retiro en tienda
            </button>
          </div>

          {/* Contenido según tipo */}
          {tipo === 'retiro' ? (
            <div className="space-y-3">
              {loadingPV ? (
                <div className="bg-stone-50 p-4 animate-pulse rounded text-center text-stone-400 text-sm">
                  Cargando locales...
                </div>
              ) : locales.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-4">No hay locales disponibles</p>
              ) : (
                locales.map(l => (
                  <button key={l.id} type="button" onClick={() => setLocalId(String(l.id))}
                    className={`w-full text-left p-4 border-2 transition-all rounded
                      ${String(l.id) === localId
                        ? 'border-red-800 bg-red-50'
                        : 'border-stone-200 hover:border-red-300'}`}>
                    <div className="flex items-start gap-3">
                      <Store size={18} className={`mt-0.5 shrink-0 ${String(l.id) === localId ? 'text-red-800' : 'text-stone-400'}`} />
                      <div>
                        <p className={`font-black text-sm ${String(l.id) === localId ? 'text-red-950' : 'text-stone-700'}`}
                           style={{fontFamily:'Elms Sans, sans-serif'}}>
                          {l.nombre}
                        </p>
                        {l.direccion && <p className="text-stone-500 text-xs mt-0.5">{l.direccion}</p>}
                        <p className="text-red-600 text-xs font-semibold mt-1">⏱ Listo en 15–20 min</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 font-medium bg-stone-50 border border-stone-100 rounded px-3 py-2">
                🛵 Por ahora hacemos domicilios solo en <strong>Ibagué</strong>.
              </p>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                  <MapPin size={12} className="inline mr-1" /> Barrio
                </label>
                <select value={zonaId} onChange={e => setZonaId(e.target.value)}
                  className="w-full border border-stone-200 px-4 py-3 text-sm text-stone-700 font-medium
                             focus:outline-none focus:border-red-800 bg-white appearance-none">
                  <option value="">Selecciona tu barrio</option>
                  {zonas.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.nombre} — domicilio ${Number(z.costo).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                  <MapPin size={12} className="inline mr-1" /> Dirección de entrega
                </label>
                <input type="text" placeholder="Ej: Cra 10 #25-30, Apto 301"
                  value={direccion} onChange={e => setDireccion(e.target.value)}
                  className="w-full border border-stone-200 px-4 py-3 text-sm text-stone-700 font-medium
                             focus:outline-none focus:border-red-800" />
              </div>
              {zonaSeleccionada && (
                <p className="text-xs text-stone-500 font-medium">
                  🛵 Costo del domicilio a {zonaSeleccionada.nombre}:{' '}
                  <strong className="text-red-800">${Number(zonaSeleccionada.costo).toLocaleString()}</strong>
                  {' '}(se suma al total)
                </p>
              )}
              <p className="text-xs text-stone-400 font-medium">
                ¿No encuentras tu barrio? Aún no llegamos a tu zona — puedes retirar en tienda o{' '}
                <a href="https://wa.me/573053067179" target="_blank" rel="noopener noreferrer"
                  className="text-red-700 font-bold hover:underline">escribirnos por WhatsApp</a>.
              </p>
            </div>
          )}

          <button type="button" onClick={confirm}
            disabled={tipo === 'domicilio' && (!zonaId || !direccion)}
            style={{fontFamily:'Elms Sans, sans-serif'}}
            className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase py-4
                       hover:bg-red-900 active:bg-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────
export default function Order() {
  const { cart, cartTotal, removeFromCart, updateQty, placeOrder } = useApp()
  const { user, refreshUser } = useAuth()
  const [form,           setForm]           = useState({ name: '', phone: '', notes: '' })
  const [confirmed,      setConfirmed]      = useState(null)
  const [errors,         setErrors]         = useState({})
  const [submitting,     setSubmitting]     = useState(false)
  const [submitError,    setSubmitError]    = useState('')
  const [showModal,      setShowModal]      = useState(false)
  const [delivery,       setDelivery]       = useState(null)
  const [codigoInput,    setCodigoInput]    = useState('')
  const [promo,          setPromo]          = useState(null)
  const [promoError,     setPromoError]     = useState('')
  const [promoLoading,   setPromoLoading]   = useState(false)
  const [canjearPuntos,  setCanjearPuntos]  = useState(false)
  const [puntosACanjear, setPuntosACanjear] = useState(100)
  const [metodoPago,     setMetodoPago]     = useState('efectivo')  // 'efectivo' | 'wompi'
  const [paymentInfo,    setPaymentInfo]    = useState(null)        // { status, statusLabel, method }

  // Pre-llenar nombre y teléfono si el usuario está logueado
  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.name || '', phone: f.phone || user.phone || '' }))
  }, [user])

  async function aplicarCodigo() {
    if (!codigoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromo(null)
    try {
      const data = await api.promociones.getByCodigo(codigoInput.trim())
      setPromo(data)
    } catch {
      setPromoError('Código inválido o expirado')
    } finally {
      setPromoLoading(false)
    }
  }

  const descuentoRegistrado = user ? Math.round(cartTotal * 0.05) : 0
  const puntosDisponibles   = user ? (user.puntos || 0) : 0
  const descuentoPuntos     = canjearPuntos && puntosDisponibles >= 100
    ? Math.floor(Math.min(puntosACanjear, puntosDisponibles) / 100) * 10000
    : 0

  function calcDescuento() {
    let d = descuentoRegistrado + descuentoPuntos
    if (promo) {
      d += promo.tipo === 'porcentaje'
        ? Math.round(cartTotal * promo.valor / 100)
        : Math.min(Number(promo.valor), cartTotal)
    }
    return Math.min(d, cartTotal)
  }

  const descuento       = calcDescuento()
  const costoDomicilio  = delivery?.tipo === 'domicilio' ? Number(delivery.costoDomicilio) || 0 : 0
  const totalFinal      = cartTotal - descuento + costoDomicilio

  function validate() {
    const e = {}
    if (!form.name.trim())  e.name  = 'Ingresa tu nombre'
    if (!form.phone.trim()) e.phone = 'Ingresa tu teléfono'
    if (!delivery)          e.delivery = 'Selecciona cómo quieres tu pedido'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      if (e.delivery) {
        // El selector de entrega queda lejos del botón: abrir el modal directamente
        setSubmitError('Falta seleccionar cómo quieres tu pedido (domicilio o retiro).')
        setShowModal(true)
      } else {
        setSubmitError('Revisa los campos marcados en rojo.')
      }
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      // Canjear puntos antes de hacer el pedido
      if (canjearPuntos && descuentoPuntos > 0) {
        await api.usuarios.canjear(Math.min(puntosACanjear, puntosDisponibles))
      }
      const order = await placeOrder({ ...form, delivery, usuarioId: user?.id, totalConDescuento: totalFinal })
      await refreshUser()

      if (metodoPago === 'wompi') {
        await iniciarPagoWompi(order)
      } else {
        setPaymentInfo(null)
      }

      setConfirmed(order)
      setForm({ name: '', phone: '', notes: '' })
      setDelivery(null)
    } catch {
      setSubmitError('Hubo un error al enviar el pedido. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Abre el widget de Wompi sobre la pantalla de confirmación.
  // Si el cliente cierra el widget sin pagar, el pedido queda con pago pendiente.
  async function iniciarPagoWompi(order) {
    try {
      const firma = await api.pagos.firma(order.id, order.total * 100)
      setPaymentInfo({ status: 'PENDING', statusLabel: 'Pendiente' })
      openWompiCheckout({
        ...firma,
        customerData: {
          fullName: form.name,
          phoneNumber: form.phone.replace(/\D/g, ''),
          phoneNumberPrefix: '+57',
          ...(user?.email ? { email: user.email } : {}),
        },
      }).then(async tx => {
        try {
          const v = await api.pagos.verificar(tx.id)
          setPaymentInfo({ status: v.status, statusLabel: v.statusLabel, method: v.paymentMethod })
        } catch {
          setPaymentInfo({ status: tx.status, statusLabel: tx.status, method: tx.paymentMethodType || tx.payment_method_type })
        }
      }).catch(() => {
        setPaymentInfo({ status: 'ERROR', statusLabel: 'Error' })
      })
    } catch {
      // El pedido ya existe; solo falló iniciar el pago en línea
      setPaymentInfo({ status: 'ERROR', statusLabel: 'Error' })
    }
  }

  // ── Confirmación ──
  if (confirmed) return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4 py-16">
      <div className="bg-white border border-stone-200 p-6 sm:p-10 max-w-md w-full text-center shadow-xl">
        <div className="text-4xl sm:text-5xl mb-5 sm:mb-6">🎉</div>
        <h2 className="text-2xl sm:text-3xl text-red-950 mb-2" style={{fontFamily:'Elms Sans, sans-serif'}}>
          ¡Pedido Confirmado!
        </h2>
        <p className="text-stone-400 mb-1 font-medium text-sm sm:text-base">
          Gracias, <strong className="text-stone-700">{confirmed.customer?.name}</strong>
        </p>
        <p className="text-stone-400 text-sm mb-3">Tu pedido está siendo preparado 🥐</p>

        {paymentInfo && (
          <div className={`border rounded px-4 py-3 mb-4 text-sm text-left font-medium
            ${paymentInfo.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700'
              : paymentInfo.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-red-50 border-red-200 text-red-700'}`}>
            {paymentInfo.status === 'APPROVED' ? (
              <p>✅ <strong>Pago aprobado</strong> vía Wompi{paymentInfo.method ? ` (${paymentInfo.method})` : ''}. ¡Gracias!</p>
            ) : paymentInfo.status === 'PENDING' ? (
              <p>⏳ <strong>Pago en proceso.</strong> Si no completaste el pago en línea, puedes pagar al recibir tu pedido.</p>
            ) : (
              <p>⚠️ <strong>El pago en línea no se completó</strong> ({paymentInfo.statusLabel}). No te preocupes: tu pedido quedó registrado y puedes pagar al recibirlo.</p>
            )}
          </div>
        )}

        {confirmed.customer?.delivery && (
          <div className="bg-stone-50 border border-stone-200 rounded px-4 py-3 mb-5 sm:mb-6 text-sm text-left">
            {confirmed.customer.delivery.tipo === 'retiro' ? (
              <p className="text-stone-600 font-medium text-xs sm:text-sm">
                🏪 <strong>Retiro en tienda</strong> — {confirmed.customer.delivery.puntoVentaNombre} · {confirmed.customer.delivery.puntoVentaDireccion}
              </p>
            ) : (
              <p className="text-stone-600 font-medium text-xs sm:text-sm">
                🛵 <strong>Domicilio</strong> — {confirmed.customer.delivery.direccion}
                {confirmed.customer.delivery.zona && `, ${confirmed.customer.delivery.zona}`}, {confirmed.customer.delivery.ciudad}
              </p>
            )}
          </div>
        )}

        <div className="bg-stone-50 border border-stone-100 p-4 sm:p-5 text-left mb-6 sm:mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Resumen</p>
          {confirmed.items?.map(i => (
            <div key={i.id} className="flex justify-between py-1.5 text-stone-600 text-sm">
              <span className="truncate mr-2">{i.emoji} {i.name} ×{i.qty}</span>
              <span className="font-semibold shrink-0">${(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-black text-red-950">
            <span>Total</span>
            <span>${confirmed.total?.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={() => { setConfirmed(null); setPaymentInfo(null) }}
          className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase py-4
                     hover:bg-red-900 transition-colors touch-manipulation">
          Hacer Otro Pedido
        </button>
        <Link to="/menu" className="block mt-3 text-sm text-stone-400 hover:text-red-800 transition-colors font-medium">
          Ver más productos →
        </Link>
      </div>
    </div>
  )

  // ── Carrito vacío ──
  if (cart.length === 0) return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 sm:w-20 h-16 sm:h-20 border-2 border-stone-200 flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <ShoppingCart size={28} className="text-stone-300" />
        </div>
        <h2 className="text-2xl sm:text-3xl text-red-950 mb-2" style={{fontFamily:'Elms Sans, sans-serif'}}>
          Tu carrito está vacío
        </h2>
        <p className="text-stone-400 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Agrega productos desde el menú para continuar</p>
        <Link to="/menu"
          className="inline-flex items-center gap-2 bg-red-950 text-white font-bold
                     text-xs tracking-widest uppercase px-8 sm:px-10 py-4 hover:bg-red-900 transition-colors">
          Ver Menú <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="bg-[#faf7f2]">
      {/* Modal */}
      {showModal && (
        <DeliveryModal
          onClose={() => setShowModal(false)}
          onConfirm={d => { setDelivery(d); setErrors(er => ({ ...er, delivery: undefined })); setSubmitError('') }}
        />
      )}

      {/* Header */}
      <div className="bg-red-950 pt-14 sm:pt-16 pb-0 text-center relative overflow-hidden">
        <div className="relative z-10 pb-10 sm:pb-12 px-4">
          <p className="text-red-400 text-xs tracking-[0.4em] uppercase font-semibold mb-2 sm:mb-3">Mi Carrito</p>
          <h1 className="text-3xl sm:text-5xl text-white" style={{fontFamily:'Elms Sans, sans-serif'}}>Tu Pedido</h1>
        </div>
        <svg viewBox="0 0 1440 50" className="w-full block" preserveAspectRatio="none">
          <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#faf7f2" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">

          {/* ── Items ── */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-4">
              {cart.length} producto{cart.length !== 1 ? 's' : ''} en tu carrito
            </p>

            {/* Selector de entrega */}
            <button onClick={() => setShowModal(true)}
              className={`w-full flex items-center justify-between p-3 sm:p-4 border-2 transition-all duration-200 mb-4 sm:mb-6
                ${errors.delivery ? 'border-red-400 bg-red-50' : delivery ? 'border-red-950 bg-white' : 'border-dashed border-stone-300 bg-white hover:border-red-800'}`}>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 sm:w-9 h-8 sm:h-9 bg-red-950 text-white flex items-center justify-center shrink-0 text-base sm:text-lg">
                  {!delivery ? '📦' : delivery.tipo === 'retiro' ? '🏪' : '🛵'}
                </div>
                <div>
                  {!delivery ? (
                    <>
                      <p className="font-bold text-stone-700 text-sm">Seleccionar tipo de entrega</p>
                      <p className="text-stone-400 text-xs">Domicilio o retiro en tienda</p>
                    </>
                  ) : delivery.tipo === 'retiro' ? (
                    <>
                      <p className="font-bold text-red-950 text-sm">Retiro en tienda</p>
                      <p className="text-stone-500 text-xs">{delivery.puntoVentaNombre} · 15–20 min</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-red-950 text-sm">Domicilio · {delivery.zona}</p>
                      <p className="text-stone-500 text-xs">{delivery.direccion} · +${Number(delivery.costoDomicilio || 0).toLocaleString()}</p>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown size={16} className="text-stone-400 shrink-0" />
            </button>
            {errors.delivery && <p className="text-red-500 text-xs font-semibold -mt-3 mb-2">{errors.delivery}</p>}

            {/* Productos */}
            {cart.map(item => (
              <div key={item.id}
                className="bg-white border border-stone-100 p-3 sm:p-5 flex gap-3 sm:gap-4 items-center hover:border-stone-200 transition-colors">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-stone-50 flex items-center justify-center text-2xl sm:text-3xl shrink-0 overflow-hidden">
                  {item.imagen
                    ? <img src={item.imagen} alt={item.name} className="w-full h-full object-cover" />
                    : item.emoji}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-bold text-red-950 text-xs sm:text-sm truncate" style={{fontFamily:'Elms Sans, sans-serif'}}>
                    {item.name}
                  </h3>
                  <p className="text-stone-400 text-xs mt-0.5">${item.price.toLocaleString()} c/u</p>
                </div>
                {/* Controles cantidad */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 border border-stone-200 text-stone-500 flex items-center justify-center
                               hover:border-red-800 hover:text-red-800 transition-colors active:bg-red-50">
                    <Minus size={11} />
                  </button>
                  <span className="w-5 text-center font-black text-stone-800 text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 border border-stone-200 text-stone-500 flex items-center justify-center
                               hover:border-red-800 hover:text-red-800 transition-colors active:bg-red-50">
                    <Plus size={11} />
                  </button>
                </div>
                {/* Precio */}
                <p className="font-black text-red-800 text-sm shrink-0 min-w-[60px] sm:min-w-[70px] text-right">
                  ${(item.price * item.qty).toLocaleString()}
                </p>
                <button onClick={() => removeFromCart(item.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors shrink-0 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <Link to="/menu"
              className="inline-flex items-center gap-2 text-red-800 font-semibold text-xs
                         tracking-widest uppercase border-b border-red-800 pb-0.5 mt-3 sm:mt-4
                         hover:text-red-950 transition-colors">
              + Agregar más productos
            </Link>
          </div>

          {/* ── Checkout ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl text-red-950 mb-4 sm:mb-5 flex items-center gap-2"
                  style={{fontFamily:'Elms Sans, sans-serif'}}>
                <ShoppingBag size={18} className="text-red-800" /> Resumen
              </h2>

              {/* Entrega seleccionada */}
              {delivery && (
                <div className="bg-stone-50 border border-stone-100 px-3 sm:px-4 py-3 mb-4 flex items-center gap-2">
                  <span className="text-base sm:text-lg">{delivery.tipo === 'retiro' ? '🏪' : '🛵'}</span>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-700 truncate">
                      {delivery.tipo === 'retiro' ? 'Retiro en tienda' : `Domicilio · ${delivery.zona}`}
                    </p>
                    {delivery.tipo === 'retiro'
                      ? <p className="text-xs text-stone-400">15–20 min</p>
                      : <p className="text-xs text-stone-400 truncate">{delivery.direccion}</p>
                    }
                  </div>
                  <button onClick={() => setShowModal(true)}
                    className="text-xs text-red-700 font-bold hover:underline shrink-0">
                    Cambiar
                  </button>
                </div>
              )}

              {/* Items mini */}
              <div className="space-y-2 mb-4 border-b border-stone-100 pb-4">
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between text-xs text-stone-500 font-medium">
                    <span className="truncate mr-2">{i.name} ×{i.qty}</span>
                    <span className="shrink-0">${(i.price * i.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Código promocional */}
              <div className="mb-4">
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                  <Tag size={11} className="inline mr-1" /> Código promocional
                </label>
                <div className="flex gap-2">
                  <input value={codigoInput}
                    onChange={e => { setCodigoInput(e.target.value.toUpperCase()); setPromo(null); setPromoError('') }}
                    placeholder="Ej: BONPAN20"
                    className="flex-1 border-b-2 border-stone-200 bg-transparent py-2 text-stone-700
                               font-mono font-bold text-sm focus:outline-none focus:border-red-800
                               tracking-widest placeholder:font-normal placeholder:tracking-normal transition-colors min-w-0" />
                  <button type="button" onClick={aplicarCodigo} disabled={promoLoading || !codigoInput}
                    className="text-xs font-bold text-red-800 border-b-2 border-red-800 pb-1
                               hover:text-red-950 disabled:opacity-40 transition-colors shrink-0">
                    {promoLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-1 font-medium">{promoError}</p>}
                {promo && (
                  <div className="flex items-center gap-2 mt-2 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                    <Check size={14} className="text-green-600 shrink-0" />
                    <p className="text-green-700 text-xs font-bold">
                      {promo.tipo === 'porcentaje' ? `${promo.valor}% de descuento` : `$${Number(promo.valor).toLocaleString()} de descuento`} aplicado
                    </p>
                    <button onClick={() => { setPromo(null); setCodigoInput('') }}
                      className="ml-auto text-green-500 hover:text-green-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Banner cliente registrado */}
              {user && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                  <Star size={16} className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-amber-800 text-xs font-bold">¡Cliente registrado! 5% de descuento aplicado</p>
                    <p className="text-amber-600 text-xs mt-0.5">Tienes <span className="font-black">{puntosDisponibles} puntos</span> acumulados</p>
                  </div>
                </div>
              )}

              {/* Canjear puntos */}
              {user && puntosDisponibles >= 100 && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Star size={13} className="text-yellow-500" /> Canjear puntos
                    </p>
                    <button onClick={() => setCanjearPuntos(v => !v)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${canjearPuntos ? 'bg-red-800' : 'bg-stone-300'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${canjearPuntos ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {canjearPuntos && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="number" min={100} max={puntosDisponibles} step={100}
                          value={puntosACanjear}
                          onChange={e => setPuntosACanjear(Math.min(Number(e.target.value), puntosDisponibles))}
                          className="w-24 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-center focus:outline-none focus:border-red-400" />
                        <p className="text-xs text-stone-500">puntos = <span className="font-bold text-green-600">-${descuentoPuntos.toLocaleString()}</span></p>
                      </div>
                      <p className="text-stone-400 text-xs">100 puntos = $10.000 de descuento</p>
                    </div>
                  )}
                </div>
              )}

              {/* Subtotal y descuento */}
              <div className="space-y-2 mb-4 border-t border-stone-100 pt-4">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                {descuentoRegistrado > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>Descuento cliente registrado (5%)</span>
                    <span>-${descuentoRegistrado.toLocaleString()}</span>
                  </div>
                )}
                {descuentoPuntos > 0 && (
                  <div className="flex justify-between text-sm text-amber-600 font-bold">
                    <span>Descuento puntos ({puntosACanjear} pts)</span>
                    <span>-${descuentoPuntos.toLocaleString()}</span>
                  </div>
                )}
                {promo && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span className="truncate mr-2">Descuento ({promo.nombre})</span>
                    <span className="shrink-0">-${(promo.tipo === 'porcentaje' ? Math.round(cartTotal * promo.valor / 100) : Math.min(Number(promo.valor), cartTotal)).toLocaleString()}</span>
                  </div>
                )}
                {costoDomicilio > 0 && (
                  <div className="flex justify-between text-sm text-stone-600 font-bold">
                    <span className="truncate mr-2">🛵 Domicilio ({delivery.zona})</span>
                    <span className="shrink-0">+${costoDomicilio.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Total</span>
                <span className="font-black text-xl sm:text-2xl text-red-950">${totalFinal.toLocaleString()}</span>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'name',  label: 'Nombre *',    placeholder: 'Tu nombre completo' },
                  { key: 'phone', label: 'Teléfono *',  placeholder: '300 000 0000' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-1.5">
                      {f.label}
                    </label>
                    <input
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`w-full border-b-2 bg-transparent py-2.5 text-stone-700 font-medium text-sm
                        focus:outline-none transition-colors
                        ${errors[f.key] ? 'border-red-400' : 'border-stone-200 focus:border-red-800'}`} />
                    {errors[f.key] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[f.key]}</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-1.5">
                    Notas (opcional)
                  </label>
                  <textarea value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Ej: sin sal, para las 3pm..."
                    rows={2}
                    className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-stone-700 font-medium
                               text-sm focus:outline-none focus:border-red-800 resize-none transition-colors" />
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                    Método de pago
                  </label>
                  <div className="grid grid-cols-2 border border-stone-200 overflow-hidden">
                    <button type="button" onClick={() => setMetodoPago('efectivo')}
                      style={{fontFamily:'Elms Sans, sans-serif'}}
                      className={`py-3 text-xs font-bold tracking-wide transition-all duration-200
                        ${metodoPago === 'efectivo'
                          ? 'bg-red-950 text-white'
                          : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
                      💵 Al recibir
                    </button>
                    <button type="button" onClick={() => setMetodoPago('wompi')}
                      style={{fontFamily:'Elms Sans, sans-serif'}}
                      className={`py-3 text-xs font-bold tracking-wide transition-all duration-200 border-l border-stone-200
                        ${metodoPago === 'wompi'
                          ? 'bg-red-950 text-white'
                          : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
                      💳 En línea
                    </button>
                  </div>
                  {metodoPago === 'wompi' && (
                    <p className="text-xs text-stone-400 mt-2 font-medium">
                      🔒 Tarjeta, PSE, Nequi y más — pago seguro con Wompi
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 border border-red-200">
                    {submitError}
                  </p>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase
                             py-4 hover:bg-red-900 active:bg-red-800 transition-colors disabled:opacity-50 mt-2 touch-manipulation">
                  {submitting ? '⏳ Enviando...' : metodoPago === 'wompi' ? '💳 Confirmar y Pagar' : 'Confirmar Pedido'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
