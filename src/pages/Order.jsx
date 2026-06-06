import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Order() {
  const { cart, cartTotal, removeFromCart, updateQty, placeOrder } = useApp()
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [confirmed, setConfirmed] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim())  e.name  = 'Ingresa tu nombre'
    if (!form.phone.trim()) e.phone = 'Ingresa tu teléfono'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setSubmitting(true)
    setSubmitError('')
    try {
      const order = await placeOrder(form)
      setConfirmed(order)
      setForm({ name: '', phone: '', notes: '' })
    } catch (err) {
      setSubmitError('Hubo un error al enviar el pedido. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmación ────────────────────────────────────────────
  if (confirmed) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-3xl font-black text-red-900 mb-2"
            style={{fontFamily:'Montserrat,sans-serif'}}>¡Pedido Confirmado!</h2>
        <p className="text-stone-500 mb-1">Gracias, <strong className="text-stone-700">{confirmed.customer?.name}</strong></p>
        <p className="text-stone-400 text-sm mb-8">Tu pedido está siendo preparado con amor 🥐</p>

        <div className="bg-stone-50 rounded-2xl p-5 text-left mb-8">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Resumen</p>
          {confirmed.items?.map(i => (
            <div key={i.id} className="flex justify-between py-1.5 text-stone-600 text-sm">
              <span>{i.emoji} {i.name} ×{i.qty}</span>
              <span className="font-semibold">${(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-black text-red-900">
            <span>Total</span>
            <span>${confirmed.total?.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={() => setConfirmed(null)}
          className="w-full bg-red-700 text-white font-bold py-3.5 rounded-2xl hover:bg-red-800 transition-colors shadow-sm">
          Hacer Otro Pedido
        </button>
        <Link to="/menu" className="block mt-3 text-sm text-stone-400 hover:text-red-700 transition-colors font-medium">
          Ver más productos →
        </Link>
      </div>
    </div>
  )

  // ── Carrito vacío ───────────────────────────────────────────
  if (cart.length === 0) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} className="text-red-300" />
        </div>
        <h2 className="text-2xl font-black text-red-900 mb-2"
            style={{fontFamily:'Montserrat,sans-serif'}}>Tu carrito está vacío</h2>
        <p className="text-stone-400 mb-8 font-medium">Agrega productos desde el menú para continuar</p>
        <Link to="/menu"
          className="inline-flex items-center gap-2 bg-red-700 text-white font-bold px-8 py-4 rounded-2xl hover:bg-red-800 transition-colors shadow-lg">
          Ver Menú <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-950 to-red-800 py-16 text-center">
        <p className="text-red-300 font-bold text-sm tracking-widest uppercase mb-3">Mi Carrito</p>
        <h1 className="text-5xl font-black text-white" style={{fontFamily:'Montserrat,sans-serif'}}>Tu Pedido</h1>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Items ────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-4">
              {cart.length} producto{cart.length !== 1 ? 's' : ''} en tu carrito
            </p>
            {cart.map(item => (
              <div key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex gap-4 items-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-red-950 text-sm leading-tight truncate"
                      style={{fontFamily:'Montserrat,sans-serif'}}>{item.name}</h3>
                  <p className="text-stone-400 text-xs mt-0.5">${item.price.toLocaleString()} c/u</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-black text-stone-800 text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="font-black text-red-700 text-sm">${(item.price * item.qty).toLocaleString()}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-xl bg-stone-50 text-stone-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <Link to="/menu"
              className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm mt-4 hover:text-red-800 transition-colors">
              + Agregar más productos
            </Link>
          </div>

          {/* ── Checkout ─────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 sticky top-24">
              <h2 className="font-black text-red-950 text-xl mb-5 flex items-center gap-2"
                  style={{fontFamily:'Montserrat,sans-serif'}}>
                <ShoppingBag size={22} className="text-red-600" /> Resumen
              </h2>

              {/* Items mini */}
              <div className="space-y-2 mb-4">
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between text-sm text-stone-500">
                    <span className="truncate mr-2">{i.name} ×{i.qty}</span>
                    <span className="font-semibold shrink-0">${(i.price * i.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-stone-100 pt-4 mb-6 flex justify-between items-center">
                <span className="font-bold text-stone-600">Total</span>
                <span className="font-black text-2xl text-red-700">${cartTotal.toLocaleString()}</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                    Nombre *
                  </label>
                  <input value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Tu nombre completo"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-stone-700 font-medium
                      focus:outline-none transition-colors
                      ${errors.name ? 'border-red-400 bg-red-50' : 'border-stone-100 focus:border-red-300'}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                    Teléfono *
                  </label>
                  <input value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="300 000 0000"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-stone-700 font-medium
                      focus:outline-none transition-colors
                      ${errors.phone ? 'border-red-400 bg-red-50' : 'border-stone-100 focus:border-red-300'}`} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                    Notas (opcional)
                  </label>
                  <textarea value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Ej: sin sal, para recoger a las 3pm..."
                    rows={3}
                    className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700 font-medium
                               focus:outline-none focus:border-red-300 resize-none transition-colors" />
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-red-700 text-white font-black py-4 rounded-2xl hover:bg-red-800
                             transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60
                             disabled:cursor-not-allowed text-base">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Enviando pedido...
                    </span>
                  ) : 'Confirmar Pedido 🎉'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
