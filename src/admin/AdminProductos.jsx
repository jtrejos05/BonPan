import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'

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
    <form onSubmit={submit} className="bg-red-50 rounded-2xl p-5 space-y-3 border border-red-200">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Nombre *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Categoría</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Precio (COP) *</label>
          <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Stock *</label>
          <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} required min="0"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Emoji</label>
          <input value={form.emoji} onChange={e => set('emoji', e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-600 mb-1 block">Descripción</label>
        <input value={form.description} onChange={e => set('description', e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white" />
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

export default function AdminProductos() {
  const { products, updateProduct, addProduct, deleteProduct } = useApp()
  const [editing, setEditing] = useState(null)
  const [adding, setAdding]   = useState(false)
  const [search, setSearch]   = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-black text-red-900" style={{fontFamily:'Montserrat,sans-serif'}}>Productos</h1>
        <p className="text-stone-500 text-sm mt-1">Gestiona el catálogo y el inventario</p>
      </div>

      <div className="flex gap-3 flex-wrap items-center justify-between">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar producto..."
          className="border border-stone-200 rounded-full px-4 py-2 text-sm text-stone-700 focus:outline-none focus:border-red-400 bg-white"
        />
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
            {filtered.map(p => (
              <>
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-semibold text-red-900">{p.emoji} {p.name}</td>
                  <td className="px-5 py-3 text-stone-500">{p.category}</td>
                  <td className="px-5 py-3 text-stone-700">${p.price.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock === 0 ? 'Agotado' : p.stock}
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
  )
}
