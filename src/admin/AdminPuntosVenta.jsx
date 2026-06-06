import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Pencil, Trash2, Check, X, Store, Eye, EyeOff } from 'lucide-react'

function PVModal({ initial, onSave, onClose }) {
  const [form,   setForm]   = useState(initial || { nombre:'', direccion:'', telefono:'', pin:'' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [showPin,setShowPin]= useState(false)
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
          <h2 className="text-white font-black text-xl" style={{fontFamily:'Playfair Display,serif'}}>
            {initial ? '✏️ Editar Local' : '🏪 Nuevo Local'}
          </h2>
          <button onClick={onClose} className="text-red-300 hover:text-white"><X size={20}/></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">Nombre del local *</label>
            <input value={form.nombre} onChange={e=>set('nombre',e.target.value)} required
              placeholder="Ej: Bon Pan Centro"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-medium focus:outline-none focus:border-red-800 transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">Dirección</label>
            <input value={form.direccion} onChange={e=>set('direccion',e.target.value)}
              placeholder="Ej: Calle 15 #23-45, Centro"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-medium focus:outline-none focus:border-red-800 transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">Teléfono</label>
            <input value={form.telefono} onChange={e=>set('telefono',e.target.value)}
              placeholder="+57 300 000 0000"
              className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                         font-medium focus:outline-none focus:border-red-800 transition-colors"/>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              PIN de acceso * {initial && '(déjalo vacío para no cambiar)'}
            </label>
            <div className="relative border-b-2 border-stone-200 focus-within:border-red-800 transition-colors">
              <input type={showPin?'text':'password'}
                value={form.pin} onChange={e=>set('pin',e.target.value)}
                required={!initial}
                placeholder="Mínimo 4 dígitos"
                className="w-full bg-transparent py-2.5 pr-10 text-stone-700 font-mono
                           font-bold focus:outline-none tracking-widest"/>
              <button type="button" onClick={()=>setShowPin(!showPin)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPin ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <p className="text-stone-400 text-xs mt-1">El empleado usa este PIN para ingresar al panel del local.</p>
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
              {saving ? '⏳ Guardando...' : <><Check size={16}/> {initial?'Guardar':'Crear local'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPuntosVenta() {
  const [locales,    setLocales]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  async function fetchLocales() {
    setLoading(true)
    try { setLocales(await api.puntosVenta.getAll()) }
    catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLocales() }, [])

  async function handleSave(data) {
    if (editing) await api.puntosVenta.update(editing.id, data)
    else         await api.puntosVenta.create(data)
    await fetchLocales()
  }

  async function handleDelete(id) {
    await api.puntosVenta.remove(id)
    setConfirmDel(null)
    await fetchLocales()
  }

  return (
    <div className="p-6 space-y-6">
      {showModal && (
        <PVModal initial={editing} onSave={handleSave} onClose={()=>setShowModal(false)}/>
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setConfirmDel(null)}/>
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl z-10">
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="font-black text-red-950 text-xl mb-2" style={{fontFamily:'Playfair Display,serif'}}>
              ¿Desactivar este local?
            </h3>
            <p className="text-stone-400 text-sm mb-6">El local no aparecerá para nuevos pedidos.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDel(null)}
                className="flex-1 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={()=>handleDelete(confirmDel)}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-700">
                Sí, desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{fontFamily:'Playfair Display,serif'}}>
            Puntos de Venta
          </h1>
          <p className="text-stone-400 text-sm mt-1">{locales.filter(l=>l.activo).length} locales activos</p>
        </div>
        <button onClick={()=>{setEditing(null);setShowModal(true)}}
          className="flex items-center gap-2 bg-red-950 text-white font-bold px-6 py-3 rounded-xl
                     hover:bg-red-900 transition-colors text-sm">
          <Plus size={18}/> Nuevo Local
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <span className="text-2xl shrink-0">💡</span>
        <div className="text-left">
          <p className="font-bold text-blue-900 text-sm">¿Cómo funcionan los puntos de venta?</p>
          <p className="text-blue-700 text-xs mt-1">
            Cada local tiene un PIN de acceso. El empleado entra a <strong>bonpan.co/punto-venta</strong>,
            selecciona su local, ingresa el PIN y ve solo los pedidos asignados a ese local en tiempo real.
          </p>
        </div>
      </div>

      {/* Grid de locales */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2].map(i=><div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-stone-100"/>)}
        </div>
      ) : locales.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Store size={48} className="mx-auto mb-3 opacity-40"/>
          <p className="font-semibold">No hay locales creados</p>
          <button onClick={()=>setShowModal(true)}
            className="mt-4 text-red-800 font-bold text-sm hover:underline">
            + Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locales.map(l => (
            <div key={l.id}
              className={`bg-white rounded-2xl border-2 p-6 transition-all
                ${l.activo ? 'border-stone-100 hover:border-red-200 hover:shadow-md' : 'border-stone-100 opacity-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <Store size={22} className="text-red-700"/>
                  </div>
                  <div>
                    <h3 className="font-black text-red-950 text-base" style={{fontFamily:'Playfair Display,serif'}}>
                      {l.nombre}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${l.activo ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                      {l.activo ? '● Activo' : '○ Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-stone-500 font-medium mb-4">
                {l.direccion && <p>📍 {l.direccion}</p>}
                {l.telefono  && <p>📞 {l.telefono}</p>}
              </div>

              {/* Link de acceso */}
              <div className="bg-stone-50 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-stone-400 font-semibold mb-1">Acceso empleados:</p>
                <p className="text-xs font-mono text-red-800 font-bold">bonpan.co/punto-venta</p>
                <p className="text-xs text-stone-500 mt-0.5">Local ID: <strong>{l.id}</strong> · PIN: protegido</p>
              </div>

              <div className="flex gap-2">
                <button onClick={()=>{setEditing(l);setShowModal(true)}}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-stone-200
                             text-stone-600 py-2 text-xs font-bold hover:border-red-800 hover:text-red-800
                             transition-colors rounded-xl">
                  <Pencil size={13}/> Editar
                </button>
                <button onClick={()=>setConfirmDel(l.id)}
                  className="flex items-center justify-center px-3 py-2 rounded-xl border border-stone-200
                             text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
