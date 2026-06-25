import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, PackageOpen, Upload, Image } from 'lucide-react'
import { api } from '../services/api'

const CATEGORIAS = ['Restaurante', 'Panadería', 'Pastelería', 'Bebidas', 'Congelados']
const EMOJIS     = ['🥐','🥧','🍰','🍪','🍫','☕','🧁','🫓','🥯']

function ProductCard({ p, onEdit, onDelete, onToggle }) {
  return (
    <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-200
      ${p.active === false ? 'border-stone-200 opacity-60' : 'border-stone-100 hover:border-red-200 hover:shadow-md'}`}>
      {/* Imagen o Emoji */}
      <div className={`flex items-center justify-center py-10 text-6xl relative overflow-hidden
        ${p.active === false ? 'bg-stone-50' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
        {p.imagen
          ? <img src={p.imagen} alt={p.name} className="w-full h-40 object-cover absolute inset-0" />
          : p.emoji}
      </div>

      <div className="p-4">
        <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
          {p.category}
        </span>
        <h3 className="font-black text-red-950 mt-2 mb-0.5 text-base leading-tight"
            style={{fontFamily:'Elms Sans, sans-serif'}}>{p.name}</h3>
        <p className="text-stone-400 text-xs mb-3 line-clamp-2">{p.description}</p>
        <p className="text-red-700 font-black text-xl mb-4">${Number(p.price).toLocaleString()}</p>

        {/* Acciones */}
        <div className="flex gap-2">
          <button onClick={() => onEdit(p)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-stone-200
                       text-stone-600 py-2 text-xs font-bold tracking-wide hover:border-red-800
                       hover:text-red-800 transition-colors rounded-lg">
            <Pencil size={13} /> Editar
          </button>
          <button onClick={() => onToggle(p)}
            className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-colors
              ${p.active === false
                ? 'border-green-200 text-green-600 hover:bg-green-50'
                : 'border-stone-200 text-stone-400 hover:border-orange-300 hover:text-orange-500'}`}
            title={p.active === false ? 'Activar producto' : 'Desactivar producto'}>
            {p.active === false ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
          </button>
          <button onClick={() => onDelete(p.id)}
            className="flex items-center justify-center px-3 py-2 rounded-lg border border-stone-200
                       text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', category: 'Restaurante', price: '',
    description: '', description_en: '', emoji: '🥐', stock: 99, imagen: ''
  })
  const [saving,       setSaving]       = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState('')
  const [preview,      setPreview]      = useState(initial?.imagen || '')
  const fileInputRef = useRef(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    // Preview local
    setPreview(URL.createObjectURL(file))
    // Subir a Cloudinary
    setUploading(true)
    try {
      const { url } = await api.upload.imagen(file)
      set('imagen', url)
    } catch (err) {
      setUploadError('Error al subir la imagen. Intenta de nuevo.')
      setPreview(initial?.imagen || '')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.price) return
    setSaving(true)
    await onSave({ ...form, price: Number(form.price), stock: 99 })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center">
      {/* Fondo — solo visible en desktop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm hidden sm:block" onClick={onClose} />

      {/* Modal: pantalla completa en móvil, centrado en desktop */}
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl shadow-2xl z-10 flex flex-col">
        {/* Header fijo */}
        <div className="bg-red-950 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-white font-black text-lg" style={{fontFamily:'Elms Sans, sans-serif'}}>
            {initial ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-red-300 hover:text-white transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Imagen del producto */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Foto del producto
            </label>
            <div
              onClick={() => !preview && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden
                transition-all duration-200 group
                ${preview ? '' : 'cursor-pointer hover:border-red-400 hover:bg-red-50'}
                ${uploading ? 'border-red-300 bg-red-50' : 'border-stone-200'}`}>
              {preview ? (
                <div className="relative h-44">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <p className="text-red-700 font-bold text-sm animate-pulse">⏳ Subiendo imagen...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center gap-3 text-stone-400">
                  <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
                    <Image size={24} className="text-stone-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-stone-500">Haz clic para subir una foto</p>
                    <p className="text-xs mt-0.5">JPG, PNG o WebP · Máx 5MB</p>
                  </div>
                </div>
              )}
            </div>
            {uploadError && <p className="text-red-500 text-xs mt-1 font-medium">{uploadError}</p>}
            {/* Botones debajo de la imagen */}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-bold border border-stone-200 px-3 py-2
                           rounded-lg text-stone-600 hover:border-red-400 hover:text-red-700 transition-colors">
                <Upload size={13} /> {preview ? 'Cambiar foto' : 'Subir foto'}
              </button>
              {preview && (
                <button type="button" onClick={() => { setPreview(''); set('imagen', '') }}
                  className="flex items-center gap-1.5 text-xs font-bold border border-red-200 px-3 py-2
                             rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} /> Eliminar imagen
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={handleImageChange} />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Nombre del producto *
            </label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="Ej: Croissant de Mantequilla"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-medium focus:outline-none focus:border-red-800 transition-colors" />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Categoría
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIAS.map(c => (
                <button key={c} type="button" onClick={() => set('category', c)}
                  className={`px-4 py-2 text-xs font-bold rounded-full border-2 transition-all
                    ${form.category === c
                      ? 'bg-red-950 text-white border-red-950'
                      : 'border-stone-200 text-stone-500 hover:border-red-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Precio (COP) *
            </label>
            <div className="flex items-center border-b-2 border-stone-200 focus-within:border-red-800 transition-colors">
              <span className="text-stone-400 font-bold mr-1">$</span>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0"
                placeholder="4500"
                className="flex-1 bg-transparent py-2.5 text-stone-700 font-medium focus:outline-none" />
            </div>
          </div>

          {/* Descripción español */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Descripción 🇨🇴
            </label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe brevemente el producto..."
              rows={2}
              className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                         font-medium text-sm focus:outline-none focus:border-red-300 resize-none transition-colors" />
          </div>

          {/* Descripción inglés */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Description in English 🇺🇸
            </label>
            <textarea value={form.description_en} onChange={e => set('description_en', e.target.value)}
              placeholder="Briefly describe the product in English..."
              rows={2}
              className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                         font-medium text-sm focus:outline-none focus:border-red-300 resize-none transition-colors" />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl
                         hover:border-stone-300 transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex-1 bg-red-950 text-white font-bold py-3 rounded-xl hover:bg-red-900
                         transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? '⏳ Subiendo imagen...' : saving ? '⏳ Guardando...' : <><Check size={16} /> {initial ? 'Guardar cambios' : 'Crear producto'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProductos() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [search,     setSearch]     = useState('')
  const [filterCat,  setFilterCat]  = useState('Todos')
  const [confirmDel, setConfirmDel] = useState(null)

  const cats     = ['Todos', ...CATEGORIAS]
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'Todos' || p.category === filterCat
    return matchSearch && matchCat
  })

  function openNew()    { setEditing(null); setShowModal(true) }
  function openEdit(p)  { setEditing(p);    setShowModal(true) }

  async function handleSave(data) {
    if (editing) await updateProduct({ ...data, id: editing.id })
    else         await addProduct(data)
  }

  function handleToggle(p) {
    updateProduct({ ...p, active: p.active === false ? true : false })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Modal */}
      {showModal && (
        <ProductModal
          initial={editing}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Confirmación eliminar */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl z-10">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="font-black text-red-950 text-xl mb-2" style={{fontFamily:'Elms Sans, sans-serif'}}>
              ¿Eliminar producto?
            </h3>
            <p className="text-stone-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={() => { deleteProduct(confirmDel); setConfirmDel(null) }}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-700">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{fontFamily:'Elms Sans, sans-serif'}}>
            Productos
          </h1>
          <p className="text-stone-400 text-sm mt-1">{products.length} productos en el catálogo</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-red-950 text-white font-bold px-6 py-3 rounded-xl
                     hover:bg-red-900 transition-colors shadow-sm text-sm">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar producto..."
          className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700
                     font-medium focus:outline-none focus:border-red-400 bg-white flex-1 max-w-xs" />
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors
                ${filterCat === c ? 'bg-red-950 text-white' : 'bg-white border border-stone-200 text-stone-500 hover:border-red-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <PackageOpen size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-semibold">No hay productos aquí todavía</p>
          <button onClick={openNew}
            className="mt-4 text-red-800 font-bold text-sm hover:underline">
            + Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => (
            <ProductCard key={p.id} p={p}
              onEdit={openEdit}
              onDelete={(id) => setConfirmDel(id)}
              onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
