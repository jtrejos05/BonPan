import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Pencil, Trash2, Check, X, Bike, MapPin } from 'lucide-react'

function ZonaModal({ initial, onSave, onClose }) {
  const [form,   setForm]   = useState(initial
    ? { nombre: initial.nombre, costo: initial.costo }
    : { nombre: '', costo: 4000 })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await onSave(form)
      onClose()
    } catch(err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white w-full max-w-md shadow-2xl z-10 rounded-2xl overflow-hidden">
        <div className="bg-red-950 px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-black text-xl" style={{fontFamily:'Elms Sans, sans-serif'}}>
            {initial ? '✏️ Editar Barrio' : '🛵 Nuevo Barrio'}
          </h2>
          <button onClick={onClose} className="text-red-300 hover:text-white"><X size={20}/></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Nombre del barrio *
            </label>
            <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} required
              placeholder="Ej: La Pola"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-medium focus:outline-none focus:border-red-800 transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Costo del domicilio *
            </label>
            <div className="flex items-center gap-2 border-b-2 border-stone-200 focus-within:border-red-800 transition-colors">
              <span className="text-stone-400 font-bold">$</span>
              <input type="number" min={0} step={500} value={form.costo} required
                onChange={e=>set('costo', e.target.value)}
                className="w-full bg-transparent py-2.5 text-stone-700 font-bold focus:outline-none"/>
            </div>
            <p className="text-stone-400 text-xs mt-1">Este valor se suma al total del pedido del cliente.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-red-950 text-white font-bold py-3 rounded-xl text-sm
                         hover:bg-red-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? '⏳ Guardando...' : <><Check size={16}/> {initial?'Guardar':'Crear barrio'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminZonas() {
  const [zonas,      setZonas]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [busy,       setBusy]       = useState(null)

  async function fetchZonas() {
    setLoading(true)
    try { setZonas(await api.zonas.getAll()) }
    catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchZonas() }, [])

  async function handleSave(data) {
    if (editing) await api.zonas.update(editing.id, { ...data, activa: editing.activa })
    else         await api.zonas.create(data)
    await fetchZonas()
  }

  async function toggleZona(id) {
    setBusy(id)
    try { await api.zonas.toggle(id); await fetchZonas() }
    catch(err) { alert(err.message) }
    finally { setBusy(null) }
  }

  async function handleDelete(id) {
    try { await api.zonas.remove(id) }
    catch(err) { alert(err.message) }
    setConfirmDel(null)
    await fetchZonas()
  }

  const activas = zonas.filter(z => z.activa).length

  return (
    <div className="p-6 space-y-6">
      {showModal && (
        <ZonaModal initial={editing} onSave={handleSave} onClose={()=>setShowModal(false)}/>
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setConfirmDel(null)}/>
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl z-10">
            <div className="text-5xl mb-4">🛵</div>
            <h3 className="font-black text-red-950 text-xl mb-2" style={{fontFamily:'Elms Sans, sans-serif'}}>
              ¿Eliminar este barrio?
            </h3>
            <p className="text-stone-400 text-sm mb-6">Los clientes de esta zona ya no podrán pedir a domicilio.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDel(null)}
                className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={()=>handleDelete(confirmDel)}
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
            Zonas de Domicilio
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Ibagué · {activas} barrio{activas !== 1 ? 's' : ''} con cobertura
          </p>
        </div>
        <button onClick={()=>{setEditing(null);setShowModal(true)}}
          className="flex items-center gap-2 bg-red-950 text-white font-bold px-6 py-3 rounded-xl
                     hover:bg-red-900 transition-colors text-sm">
          <Plus size={18}/> Nuevo Barrio
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <span className="text-2xl shrink-0">🛵</span>
        <div className="text-left">
          <p className="font-bold text-blue-900 text-sm">¿Cómo funcionan las zonas de cobertura?</p>
          <p className="text-blue-700 text-xs mt-1">
            Los clientes solo pueden pedir a domicilio en los barrios <strong>activos</strong> de esta lista,
            y el costo se suma automáticamente al total del pedido. Desactiva un barrio cuando no tengas
            domiciliario para esa zona, o edítalo para cambiar el precio.
          </p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i=><div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-stone-100"/>)}
        </div>
      ) : zonas.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-40"/>
          <p className="font-semibold">No hay barrios creados</p>
          <button onClick={()=>setShowModal(true)}
            className="mt-4 text-red-800 font-bold text-sm hover:underline">
            + Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {zonas.map(z => (
            <div key={z.id}
              className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-3 transition-all
                ${z.activa ? 'border-stone-100' : 'border-stone-100 opacity-50'}`}>
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Bike size={18} className="text-red-700"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-800 text-sm truncate">{z.nombre}</p>
                <p className="text-xs text-stone-400">Domicilio: <strong className="text-red-800">${Number(z.costo).toLocaleString()}</strong></p>
              </div>
              {/* Activar/desactivar */}
              <button onClick={()=>toggleZona(z.id)} disabled={busy===z.id}
                title={z.activa ? 'Desactivar zona' : 'Activar zona'}
                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 disabled:opacity-50
                  ${z.activa ? 'bg-green-500' : 'bg-stone-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all
                  ${z.activa ? 'left-5' : 'left-0.5'}`}/>
              </button>
              <button onClick={()=>{setEditing(z);setShowModal(true)}}
                className="p-2 rounded-xl border border-stone-200 text-stone-400
                           hover:border-red-800 hover:text-red-800 transition-colors shrink-0">
                <Pencil size={13}/>
              </button>
              <button onClick={()=>setConfirmDel(z.id)}
                className="p-2 rounded-xl border border-stone-200 text-stone-400
                           hover:border-red-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
