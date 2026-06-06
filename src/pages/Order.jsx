import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Order() {
  const { cart, cartTotal, removeFromCart, updateQty, placeOrder } = useApp()
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [confirmed, setConfirmed] = useState(null)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Ingresa tu nombre'
    if (!form.phone.trim()) e.phone = 'Ingresa tu teléfono'
    return e
  }

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h2 className="text-3xl font-black text-red-900 mb-2">¡Pedido Confirmado!</h2>
        <p className="text-stone-500 mb-1">Gracias, <strong>{confirmed.customer.name}</strong></p>
        <p className="text-stone-500 mb-6">Tu pedido <strong>#{confirmed.id}</strong> está siendo preparado.</p>
        <div className="bg-red-50 rounded-2xl p-5 text-left mb-8">
          {confirmed.items.map(i => (
            <div key={i.id} className="flex justify-between py-1 text-stone-700 text-sm">
              <span>{i.emoji} {i.name} x{i.qty}</span>
              <span>${(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-red-200 mt-3 pt-3 flex justify-between font-bold text-red-900">
            <span>Total</span>
            <span>${confirmed.total.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={() => setConfirmed(null)}
          className="bg-red-700 text-white font-bold px-8 py-3 rounded-full hover:bg-red-800 transition-colors">
          Hacer Otro Pedido
        </button>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-black text-red-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-stone-500 mb-8">Agrega productos desde el menú para continuar.</p>
        <Link to="/menu" className="bg-red-700 text-white font-bold px-8 py-3 rounded-full hover:bg-red-800 transition-colors">
          Ir al Menú
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black text-red-900 mb-8 text-center">Tu Pedido</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-3 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center text-left">
              <div className="text-4xl">{item.emoji}</div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900">{item.name}</h3>
                <p className="text-stone-500 text-sm">${item.price.toLocaleString()} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center hover:bg-red-200 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-bold text-stone-700">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center hover:bg-red-200 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold text-red-800">${(item.price * item.qty).toLocaleString()}</p>
              </div>
              <button onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-600 transition-colors ml-2">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 text-left">
            <h2 className="text-xl font-black text-red-900 mb-5 flex items-center gap-2">
              <ShoppingBag size={22} /> Resumen
            </h2>
            <div className="space-y-2 mb-4 text-sm text-stone-600">
              {cart.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.name} x{i.qty}</span>
                  <span>${(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 mb-6 flex justify-between font-bold text-lg text-red-900">
              <span>Total</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Nombre *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className={`w-full border rounded-xl px-4 py-2.5 text-stone-700 focus:outline-none focus:border-red-400 ${errors.name ? 'border-red-400' : 'border-stone-200'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Teléfono *</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="300 000 0000"
                  className={`w-full border rounded-xl px-4 py-2.5 text-stone-700 focus:outline-none focus:border-red-400 ${errors.phone ? 'border-red-400' : 'border-stone-200'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ej: sin sal, para recoger a las 3pm..."
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 focus:outline-none focus:border-red-400 resize-none"
                />
              </div>
              {submitError && (
                <p className="text-red-500 text-sm text-center font-medium">{submitError}</p>
              )}
              <button type="submit" disabled={submitting}
                className="w-full bg-red-700 text-white font-bold py-3 rounded-full hover:bg-red-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? 'Enviando pedido...' : 'Confirmar Pedido 🎉'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
