import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Pencil, Trash2, Plus, X, Check, Package, ClipboardList } from 'lucide-react'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']
const STATUS_COLORS = {
  'Pendiente': 'bg-yellow-100 text-yellow-700',
  'En preparación': 'bg-blue-100 text-blue-700',
  'Listo': 'bg-green-100 text-green-700',
  'Entregado': 'bg-stone-100 text-stone-600',
  'Cancelado': 'bg-red-100 text-red-600',
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', category: 'Croissants', price: '', description: '', emoji: '🥐', stock: '' })
  const cats = ['Croissants', 'Pasteles Salados', 'Hojaldre Dulce', 'Bebidas']
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) return
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) })
  }

  return (
    <form onSubmit={submit} className="bg-red-50 rounded-2xl p-5 space-y-3 border border-red-200 text-left">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Nombre *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Categoría</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Precio *</label>
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Stock *</label>
          <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} required min="0"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Emoji</label>
          <input value={form.emoji} onChange={e => set('emoji', e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Descripción</label>
        <input value={form.description} onChange={e => set('description', e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm border border-stone-200 text-stone-600 hover:bg-stone-100">
          <X size={14} /> Cancelar
        </button>
        <button type="submit"
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm bg-red-700 text-white hover:bg-red-800">
          <Check size={14} /> Guardar
        </button>
      </div>
    </form>
  )
}

export default function Admin() {
  const { products, updateProduct, addProduct, deleteProduct, orders, updateOrderStatus } = useApp()
  const [tab, setTab] = useState('products')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)

  const totalRevenue = orders.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-red-900 mb-2">Panel de Administración</h1>
        <p className="text-stone-500 font-medium">Gestiona productos, inventario y pedidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Productos', value: products.length, icon: '📦' },
          { label: 'Pedidos', value: orders.length, icon: '📋' },
          { label: 'Pendientes', value: orders.filter(o => o.status === 'Pendiente').length, icon: '⏳' },
          { label: 'Ingresos', value: `$${totalRevenue.toLocaleString()}`, icon: '💰' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-red-900">{s.value}</div>
            <div className="text-stone-500 text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 justify-center">
        {[
          { key: 'products', label: 'Productos', icon: <Package size={16} /> },
          { key: 'orders', label: 'Pedidos', icon: <ClipboardList size={16} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors
              ${tab === t.key ? 'bg-red-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-red-400'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setAdding(true); setEditing(null) }}
              className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-800 transition-colors">
              <Plus size={16} /> Nuevo Producto
            </button>
          </div>

          {adding && (
            <ProductForm
              onSave={p => { addProduct(p); setAdding(false) }}
              onCancel={() => setAdding(false)}
            />
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50 text-stone-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Producto</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map(p => (
                  <>
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3 font-semibold text-red-900">{p.emoji} {p.name}</td>
                      <td className="px-5 py-3 text-stone-500">{p.category}</td>
                      <td className="px-5 py-3 text-stone-700">${p.price.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditing(p.id); setAdding(false) }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editing === p.id && (
                      <tr key={`edit-${p.id}`}>
                        <td colSpan={5} className="px-5 py-3">
                          <ProductForm
                            initial={p}
                            onSave={updated => { updateProduct(updated); setEditing(null) }}
                            onCancel={() => setEditing(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">📋</div>
              <p>Aún no hay pedidos registrados.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-5 text-left">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-red-900">Pedido #{order.id}</h3>
                    <p className="text-stone-500 text-sm">{order.date} · {order.customer.name} · {order.customer.phone}</p>
                    {order.customer.notes && <p className="text-stone-400 text-xs mt-1">📝 {order.customer.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      className="border border-stone-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-red-400 bg-white">
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items.map(i => (
                    <span key={i.id} className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                      {i.emoji} {i.name} x{i.qty}
                    </span>
                  ))}
                </div>
                <p className="font-bold text-red-900">Total: ${order.total.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
