import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart, X, MapPin, Store, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TIENDA = {
  nombre: 'Bon Pan — Centro',
  direccion: 'Calle 15 #23-45, Centro, Pereira',
  tiempo: '15–20 min',
}

// ── Modal de tipo de entrega ─────────────────────────────────
function DeliveryModal({ onClose, onConfirm }) {
  const [tipo,      setTipo]      = useState('retiro')
  const [ciudad,    setCiudad]    = useState('')
  const [direccion, setDireccion] = useState('')

  function confirm() {
    if (tipo === 'domicilio' && (!ciudad.trim() || !direccion.trim())) return
    onConfirm({ tipo, ciudad, direccion })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-100">
          <h2 className="text-2xl text-red-950" style={{fontFamily:'Playfair Display, serif'}}>
            ¿Cómo quieres tu pedido?
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Toggle Domicilio / Retiro */}
          <div className="grid grid-cols-2 border border-stone-200 overflow-hidden">
            <button
              onClick={() => setTipo('domicilio')}
              className={`py-3 text-sm font-bold tracking-wide transition-all duration-200
                ${tipo === 'domicilio'
                  ? 'bg-red-950 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
              🛵 Domicilio
            </button>
            <button
              onClick={() => setTipo('retiro')}
              className={`py-3 text-sm font-bold tracking-wide transition-all duration-200 border-l border-stone-200
                ${tipo === 'retiro'
                  ? 'bg-red-950 text-white'
                  : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
              🏪 Retiro en tienda
            </button>
          </div>

          {/* Contenido según tipo */}
          {tipo === 'retiro' ? (
            <div className="bg-red-50 border-2 border-red-800 p-4">
              <div className="flex items-start gap-3">
                <Store size={20} className="text-red-800 mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-red-950 text-sm">{TIENDA.nombre}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{TIENDA.direccion}</p>
                  <p className="text-red-600 text-xs font-semibold mt-1">⏱ Listo en {TIENDA.tiempo}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                  <MapPin size={12} className="inline mr-1" /> Ciudad
                </label>
                <select value={ciudad} onChange={e => setCiudad(e.target.value)}
                  className="w-full border border-stone-200 px-4 py-3 text-sm text-stone-700 font-medium
                             focus:outline-none focus:border-red-800 bg-white appearance-none">
                  <option value="">Selecciona una ciudad</option>
                  <option>Pereira</option>
                  <option>Dosquebradas</option>
                  <option>Santa Rosa de Cabal</option>
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
              <p className="text-xs text-stone-400 font-medium">
                🛵 El domicilio tiene un costo adicional según la distancia.
              </p>
            </div>
          )}

          <button onClick={confirm}
            disabled={tipo === 'domicilio' && (!ciudad || !direccion)}
            className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase py-4
                       hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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
  const [form,         setForm]         = useState({ name: '', phone: '', notes: '' })
  const [confirmed,    setConfirmed]    = useState(null)
  const [errors,       setErrors]       = useState({})
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [delivery,     setDelivery]     = useState(null) // { tipo, ciudad, direccion }

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
    if (Object.keys(e).length) return setErrors(e)
    setSubmitting(true)
    setSubmitError('')
    try {
      const order = await placeOrder({ ...form, delivery })
      setConfirmed(order)
      setForm({ name: '', phone: '', notes: '' })
      setDelivery(null)
    } catch {
      setSubmitError('Hubo un error al enviar el pedido. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmación ──
  if (confirmed) return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4 py-20">
      <div className="bg-white border border-stone-200 p-10 max-w-md w-full text-center shadow-xl">
        <div className="text-5xl mb-6">🎉</div>
        <h2 className="text-3xl text-red-950 mb-2" style={{fontFamily:'Playfair Display, serif'}}>
          ¡Pedido Confirmado!
        </h2>
        <p className="text-stone-400 mb-1 font-medium">Gracias, <strong className="text-stone-700">{confirmed.customer?.name}</strong></p>
        <p className="text-stone-400 text-sm mb-2">Tu pedido está siendo preparado 🥐</p>

        {confirmed.customer?.delivery && (
          <div className="bg-stone-50 border border-stone-200 rounded px-4 py-3 mb-6 text-sm text-left">
            {confirmed.customer.delivery.tipo === 'retiro' ? (
              <p className="text-stone-600 font-medium">🏪 <strong>Retiro en tienda</strong> — {TIENDA.direccion}</p>
            ) : (
              <p className="text-stone-600 font-medium">🛵 <strong>Domicilio</strong> — {confirmed.customer.delivery.direccion}, {confirmed.customer.delivery.ciudad}</p>
            )}
          </div>
        )}

        <div className="bg-stone-50 border border-stone-100 p-5 text-left mb-8">
          <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Resumen</p>
          {confirmed.items?.map(i => (
            <div key={i.id} className="flex justify-between py-1.5 text-stone-600 text-sm">
              <span>{i.emoji} {i.name} ×{i.qty}</span>
              <span className="font-semibold">${(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-black text-red-950">
            <span>Total</span>
            <span>${confirmed.total?.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={() => setConfirmed(null)}
          className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase py-4
                     hover:bg-red-900 transition-colors">
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
        <div className="w-20 h-20 border-2 border-stone-200 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={32} className="text-stone-300" />
        </div>
        <h2 className="text-3xl text-red-950 mb-2" style={{fontFamily:'Playfair Display, serif'}}>
          Tu carrito está vacío
        </h2>
        <p className="text-stone-400 mb-8 font-medium">Agrega productos desde el menú para continuar</p>
        <Link to="/menu"
          className="inline-flex items-center gap-2 bg-red-950 text-white font-bold
                     text-xs tracking-widest uppercase px-10 py-4 hover:bg-red-900 transition-colors">
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
          onConfirm={d => setDelivery(d)}
        />
      )}

      {/* Header */}
      <div className="bg-red-950 pt-16 pb-0 text-center relative overflow-hidden">
        <div className="relative z-10 pb-12">
          <p className="text-red-400 text-xs tracking-[0.4em] uppercase font-semibold mb-3">Mi Carrito</p>
          <h1 className="text-5xl text-white" style={{fontFamily:'Playfair Display, serif'}}>Tu Pedido</h1>
        </div>
        <svg viewBox="0 0 1440 50" className="w-full block" preserveAspectRatio="none">
          <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#faf7f2" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Items ── */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-5">
              {cart.length} producto{cart.length !== 1 ? 's' : ''} en tu carrito
            </p>

            {/* Selector de entrega */}
            <button onClick={() => setShowModal(true)}
              className={`w-full flex items-center justify-between p-4 border-2 transition-all duration-200 mb-6
                ${errors.delivery ? 'border-red-400 bg-red-50' : delivery ? 'border-red-950 bg-white' : 'border-dashed border-stone-300 bg-white hover:border-red-800'}`}>
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 bg-red-950 text-white flex items-center justify-center shrink-0 text-lg">
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
                      <p className="text-stone-500 text-xs">{TIENDA.nombre} · {TIENDA.tiempo}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-red-950 text-sm">Domicilio a {delivery.ciudad}</p>
                      <p className="text-stone-500 text-xs">{delivery.direccion}</p>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown size={16} className="text-stone-400 shrink-0" />
            </button>
            {errors.delivery && <p className="text-red-500 text-xs font-semibold -mt-4 mb-2">{errors.delivery}</p>}

            {/* Productos */}
            {cart.map(item => (
              <div key={item.id}
                className="bg-white border border-stone-100 p-5 flex gap-4 items-center hover:border-stone-200 transition-colors">
                <div className="w-14 h-14 bg-stone-50 flex items-center justify-center text-3xl shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-bold text-red-950 text-sm truncate" style={{fontFamily:'Playfair Display,serif'}}>
                    {item.name}
                  </h3>
                  <p className="text-stone-400 text-xs mt-0.5">${item.price.toLocaleString()} c/u</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 border border-stone-200 text-stone-500 flex items-center justify-center
                               hover:border-red-800 hover:text-red-800 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-stone-800 text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 border border-stone-200 text-stone-500 flex items-center justify-center
                               hover:border-red-800 hover:text-red-800 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <p className="font-black text-red-800 text-sm shrink-0 min-w-[70px] text-right">
                  ${(item.price * item.qty).toLocaleString()}
                </p>
                <button onClick={() => removeFromCart(item.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <Link to="/menu"
              className="inline-flex items-center gap-2 text-red-800 font-semibold text-xs
                         tracking-widest uppercase border-b border-red-800 pb-0.5 mt-4
                         hover:text-red-950 transition-colors">
              + Agregar más productos
            </Link>
          </div>

          {/* ── Checkout ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 p-6 sticky top-24">
              <h2 className="text-xl text-red-950 mb-5 flex items-center gap-2"
                  style={{fontFamily:'Playfair Display, serif'}}>
                <ShoppingBag size={20} className="text-red-800" /> Resumen
              </h2>

              {/* Entrega seleccionada */}
              {delivery && (
                <div className="bg-stone-50 border border-stone-100 px-4 py-3 mb-4 flex items-center gap-2">
                  <span className="text-lg">{delivery.tipo === 'retiro' ? '🏪' : '🛵'}</span>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold text-stone-700">
                      {delivery.tipo === 'retiro' ? 'Retiro en tienda' : `Domicilio · ${delivery.ciudad}`}
                    </p>
                    {delivery.tipo === 'retiro'
                      ? <p className="text-xs text-stone-400">{TIENDA.tiempo}</p>
                      : <p className="text-xs text-stone-400">{delivery.direccion}</p>
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

              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Subtotal</span>
                <span className="font-black text-2xl text-red-950">${cartTotal.toLocaleString()}</span>
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
                      className={`w-full border-b-2 bg-transparent py-2 text-stone-700 font-medium text-sm
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

                {submitError && (
                  <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 border border-red-200">
                    {submitError}
                  </p>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase
                             py-4 hover:bg-red-900 transition-colors disabled:opacity-50 mt-2">
                  {submitting ? '⏳ Enviando...' : 'Confirmar Pedido'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
