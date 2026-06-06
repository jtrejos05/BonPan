import { useState } from 'react'
import { Plus, X, Check, Tag, ToggleLeft, ToggleRight, Trash2, Calendar, Percent, DollarSign } from 'lucide-react'

// Hook local para promociones (más adelante se conecta al backend)
function usePromociones() {
  const [promociones, setPromociones] = useState([
    {
      id: 1,
      nombre: '2x1 en Croissants',
      descripcion: 'Lleva 2 croissants de mantequilla y paga solo 1.',
      tipo: 'porcentaje',
      valor: 50,
      categorias: ['Croissants'],
      activa: true,
      fechaInicio: '2026-06-01',
      fechaFin: '2026-06-30',
      codigo: 'CROIS2X1',
      usos: 12,
    },
  ])

  function add(promo)    { setPromociones(p => [{ ...promo, id: Date.now(), usos: 0 }, ...p]) }
  function toggle(id)    { setPromociones(p => p.map(x => x.id === id ? { ...x, activa: !x.activa } : x)) }
  function remove(id)    { setPromociones(p => p.filter(x => x.id !== id)) }
  function update(promo) { setPromociones(p => p.map(x => x.id === promo.id ? promo : x)) }

  return { promociones, add, toggle, remove, update }
}

const CATEGORIAS = ['Todos los productos', 'Croissants', 'Pasteles Salados', 'Hojaldre Dulce', 'Bebidas']

function PromoModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    nombre: '', descripcion: '', tipo: 'porcentaje', valor: '',
    categorias: [], activa: true, fechaInicio: '', fechaFin: '', codigo: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function toggleCat(c) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(c)
        ? f.categorias.filter(x => x !== c)
        : [...f.categorias, c]
    }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.nombre || !form.valor) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl z-10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-red-950 px-6 py-5 flex items-center justify-between sticky top-0">
          <h2 className="text-white font-black text-xl" style={{fontFamily:'Playfair Display,serif'}}>
            {initial ? '✏️ Editar Promoción' : '🎉 Nueva Promoción'}
          </h2>
          <button onClick={onClose} className="text-red-300 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Nombre de la promoción *
            </label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required
              placeholder="Ej: 2x1 en Croissants"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-medium focus:outline-none focus:border-red-800 transition-colors" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Descripción (visible al cliente)
            </label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Ej: Lleva 2 croissants y paga solo 1"
              rows={2}
              className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                         font-medium text-sm focus:outline-none focus:border-red-300 resize-none" />
          </div>

          {/* Tipo de descuento */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Tipo de descuento
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'porcentaje', label: '% Porcentaje', icon: <Percent size={16} />, ex: 'Ej: 20% de descuento' },
                { key: 'valor',      label: '$ Valor fijo',  icon: <DollarSign size={16} />, ex: 'Ej: $5.000 menos' },
              ].map(t => (
                <button key={t.key} type="button" onClick={() => set('tipo', t.key)}
                  className={`p-4 border-2 rounded-xl text-left transition-all
                    ${form.tipo === t.key ? 'border-red-800 bg-red-50' : 'border-stone-200 hover:border-red-200'}`}>
                  <div className={`flex items-center gap-2 font-bold text-sm mb-1 ${form.tipo === t.key ? 'text-red-800' : 'text-stone-600'}`}>
                    {t.icon} {t.label}
                  </div>
                  <p className="text-stone-400 text-xs">{t.ex}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              {form.tipo === 'porcentaje' ? 'Porcentaje de descuento *' : 'Valor a descontar (COP) *'}
            </label>
            <div className="flex items-center border-b-2 border-stone-200 focus-within:border-red-800 transition-colors">
              <span className="text-stone-400 font-bold mr-2">
                {form.tipo === 'porcentaje' ? '%' : '$'}
              </span>
              <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)}
                required min="1" max={form.tipo === 'porcentaje' ? 100 : undefined}
                placeholder={form.tipo === 'porcentaje' ? '20' : '5000'}
                className="flex-1 bg-transparent py-2.5 text-stone-700 font-medium focus:outline-none" />
            </div>
          </div>

          {/* Código promocional */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Código promocional (opcional)
            </label>
            <input value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())}
              placeholder="Ej: BONPAN20"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-mono font-bold focus:outline-none focus:border-red-800 transition-colors tracking-widest" />
            <p className="text-stone-400 text-xs mt-1">Si lo dejas vacío, el descuento se aplica automáticamente.</p>
          </div>

          {/* Categorías */}
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Aplicar a
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(c => (
                <button key={c} type="button" onClick={() => toggleCat(c)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all
                    ${form.categorias.includes(c)
                      ? 'bg-red-950 text-white border-red-950'
                      : 'border-stone-200 text-stone-500 hover:border-red-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                <Calendar size={12} className="inline mr-1" /> Fecha inicio
              </label>
              <input type="date" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)}
                className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-stone-700
                           font-medium text-sm focus:outline-none focus:border-red-800 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                <Calendar size={12} className="inline mr-1" /> Fecha fin
              </label>
              <input type="date" value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)}
                className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-stone-700
                           font-medium text-sm focus:outline-none focus:border-red-800 transition-colors" />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl text-sm">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 bg-red-950 text-white font-bold py-3 rounded-xl text-sm
                         hover:bg-red-900 transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> {initial ? 'Guardar cambios' : 'Crear promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PromoCard({ p, onToggle, onEdit, onDelete }) {
  const isExpired = p.fechaFin && new Date(p.fechaFin) < new Date()
  const isActive  = p.activa && !isExpired

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 transition-all
      ${isActive ? 'border-stone-100 hover:border-red-200 hover:shadow-md' : 'border-stone-100 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
            ${isActive ? 'bg-red-50' : 'bg-stone-100'}`}>
            🎉
          </div>
          <div>
            <h3 className="font-black text-red-950 text-base leading-tight"
                style={{fontFamily:'Playfair Display,serif'}}>{p.nombre}</h3>
            {p.codigo && (
              <span className="text-xs font-mono font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded mt-0.5 inline-block">
                {p.codigo}
              </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0
          ${isExpired ? 'bg-stone-100 text-stone-400' : isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
          {isExpired ? 'Expirada' : isActive ? 'Activa' : 'Pausada'}
        </span>
      </div>

      <p className="text-stone-500 text-sm mb-3">{p.descripcion}</p>

      <div className="flex items-center gap-3 flex-wrap text-xs text-stone-400 font-medium mb-4">
        <span className="flex items-center gap-1">
          {p.tipo === 'porcentaje' ? <Percent size={12} /> : <DollarSign size={12} />}
          {p.tipo === 'porcentaje' ? `${p.valor}% de descuento` : `$${Number(p.valor).toLocaleString()} menos`}
        </span>
        {p.fechaFin && (
          <span className="flex items-center gap-1">
            <Calendar size={12} /> Hasta {new Date(p.fechaFin).toLocaleDateString('es-CO')}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Tag size={12} /> {p.usos} usos
        </span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onToggle(p.id)}
          className={`flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl border-2 text-xs font-bold transition-colors
            ${isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
          {isActive ? <><ToggleRight size={14} /> Pausar</> : <><ToggleLeft size={14} /> Activar</>}
        </button>
        <button onClick={() => onEdit(p)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-stone-200
                     text-stone-500 hover:border-red-300 hover:text-red-700 transition-colors text-xs font-bold">
          <Pencil size={13} /> Editar
        </button>
        <button onClick={() => onDelete(p.id)}
          className="flex items-center justify-center px-3 py-2 rounded-xl border-2 border-stone-200
                     text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// Importamos Pencil que nos faltaba
import { Pencil } from 'lucide-react'

export default function AdminPromociones() {
  const { promociones, add, toggle, remove, update } = usePromociones()
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)

  function openNew()   { setEditing(null); setShowModal(true) }
  function openEdit(p) { setEditing(p);    setShowModal(true) }
  function handleSave(data) {
    if (editing) update({ ...data, id: editing.id, usos: editing.usos })
    else         add(data)
  }

  const activas  = promociones.filter(p => p.activa)
  const pausadas = promociones.filter(p => !p.activa)

  return (
    <div className="p-6 space-y-6">
      {showModal && (
        <PromoModal initial={editing} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{fontFamily:'Playfair Display,serif'}}>
            Promociones
          </h1>
          <p className="text-stone-400 text-sm mt-1">{activas.length} activas · {pausadas.length} pausadas</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-red-950 text-white font-bold px-6 py-3 rounded-xl
                     hover:bg-red-900 transition-colors shadow-sm text-sm">
          <Plus size={18} /> Nueva Promoción
        </button>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <span className="text-2xl shrink-0">💡</span>
        <div className="text-left">
          <p className="font-bold text-amber-900 text-sm">¿Cómo funcionan las promociones?</p>
          <p className="text-amber-700 text-xs mt-1">
            Crea descuentos por porcentaje o valor fijo. Puedes asignar un código que el cliente ingresa al pedir,
            o dejarlo sin código para que aplique automáticamente a todos los productos de la categoría.
          </p>
        </div>
      </div>

      {/* Lista */}
      {promociones.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-semibold">No hay promociones creadas aún</p>
          <button onClick={openNew} className="mt-4 text-red-800 font-bold text-sm hover:underline">
            + Crear la primera promoción
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {promociones.map(p => (
            <PromoCard key={p.id} p={p}
              onToggle={toggle}
              onEdit={openEdit}
              onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
