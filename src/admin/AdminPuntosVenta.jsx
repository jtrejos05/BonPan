import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Pencil, Trash2, Check, X, Store, Eye, EyeOff, Monitor, ShieldCheck, ShieldAlert, History, Clock } from 'lucide-react'

function PVModal({ initial, onSave, onClose }) {
  const [form,   setForm]   = useState(initial
    ? { ...initial, pin: '', hora_apertura: initial.hora_apertura || '', hora_cierre: initial.hora_cierre || '' }
    : { nombre:'', direccion:'', telefono:'', pin:'', hora_apertura:'', hora_cierre:'' })
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
          <h2 className="text-white font-black text-xl" style={{fontFamily:'Elms Sans, sans-serif'}}>
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

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
              Horario de acceso al panel
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-400 mb-1">Desde</p>
                <input type="time" value={form.hora_apertura} onChange={e=>set('hora_apertura',e.target.value)}
                  className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-stone-700
                             font-medium focus:outline-none focus:border-red-800 transition-colors"/>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Hasta</p>
                <input type="time" value={form.hora_cierre} onChange={e=>set('hora_cierre',e.target.value)}
                  className="w-full border-b-2 border-stone-200 bg-transparent py-2 text-stone-700
                             font-medium focus:outline-none focus:border-red-800 transition-colors"/>
              </div>
            </div>
            <p className="text-stone-400 text-xs mt-1">
              Fuera de este horario los empleados no podrán ingresar al panel. Déjalo vacío para permitir siempre.
            </p>
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
  const [locales,      setLocales]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showModal,    setShowModal]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [confirmDel,   setConfirmDel]   = useState(null)
  const [dispositivos, setDispositivos] = useState([])
  const [accesos,      setAccesos]      = useState([])
  const [busyDevice,   setBusyDevice]   = useState(null)

  async function fetchLocales() {
    setLoading(true)
    try { setLocales(await api.puntosVenta.getAll()) }
    catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function fetchSeguridad() {
    try {
      const [d, a] = await Promise.all([
        api.puntosVenta.dispositivos.getAll(),
        api.puntosVenta.accesos(50),
      ])
      setDispositivos(d)
      setAccesos(a)
    } catch(err) { console.error(err) }
  }

  useEffect(() => { fetchLocales(); fetchSeguridad() }, [])

  async function toggleDispositivo(id) {
    setBusyDevice(id)
    try { await api.puntosVenta.dispositivos.aprobar(id); await fetchSeguridad() }
    catch(err) { alert(err.message) }
    finally { setBusyDevice(null) }
  }

  async function eliminarDispositivo(id) {
    setBusyDevice(id)
    try { await api.puntosVenta.dispositivos.remove(id); await fetchSeguridad() }
    catch(err) { alert(err.message) }
    finally { setBusyDevice(null) }
  }

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
            <h3 className="font-black text-red-950 text-xl mb-2" style={{fontFamily:'Elms Sans, sans-serif'}}>
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
          <h1 className="text-3xl font-black text-gray-900" style={{fontFamily:'Elms Sans, sans-serif'}}>
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
                    <h3 className="font-black text-red-950 text-base" style={{fontFamily:'Elms Sans, sans-serif'}}>
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
                {l.hora_apertura && l.hora_cierre && (
                  <p>🕐 Acceso empleados: {l.hora_apertura} – {l.hora_cierre}</p>
                )}
              </div>

              {/* Link de acceso */}
              <div className="bg-stone-50 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-stone-400 font-semibold mb-1">Acceso empleados:</p>
                <p className="text-xs font-mono text-red-800 font-bold">{window.location.origin}/punto-venta</p>
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

      {/* ── Dispositivos de empleados ─────────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Monitor size={20} className="text-red-800"/>
          <h2 className="text-xl font-black text-gray-900" style={{fontFamily:'Elms Sans, sans-serif'}}>
            Dispositivos autorizados
          </h2>
          {dispositivos.filter(d=>!d.aprobado).length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full">
              {dispositivos.filter(d=>!d.aprobado).length} pendiente(s)
            </span>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl shrink-0">🔒</span>
          <div className="text-left">
            <p className="font-bold text-blue-900 text-sm">Solo los equipos aprobados pueden entrar al panel de ventas</p>
            <p className="text-blue-700 text-xs mt-1">
              La primera vez que un equipo (tablet o computador del local) intenta ingresar, queda registrado aquí
              como <strong>pendiente</strong>. Apruébalo solo si es un equipo del local. Si una empleada intenta
              entrar desde su casa o su celular, aparecerá aquí y podrás rechazarlo.
            </p>
          </div>
        </div>

        {dispositivos.length === 0 ? (
          <div className="text-center py-10 text-stone-400 bg-white rounded-2xl border border-stone-100">
            <Monitor size={36} className="mx-auto mb-2 opacity-40"/>
            <p className="font-semibold text-sm">Aún no hay dispositivos registrados</p>
            <p className="text-xs mt-1">Aparecerán cuando un empleado intente ingresar al panel de ventas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dispositivos.map(d => (
              <div key={d.id}
                className={`bg-white rounded-2xl border-2 p-4 flex flex-wrap items-center gap-3
                  ${d.aprobado ? 'border-stone-100' : 'border-amber-200 bg-amber-50/40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${d.aprobado ? 'bg-green-50' : 'bg-amber-100'}`}>
                  {d.aprobado
                    ? <ShieldCheck size={20} className="text-green-600"/>
                    : <ShieldAlert size={20} className="text-amber-600"/>}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <p className="font-bold text-stone-800 text-sm">
                    {d.nombre || `Dispositivo #${d.id}`}
                    <span className="text-stone-400 font-medium"> · {d.pv_nombre}</span>
                  </p>
                  <p className="text-xs text-stone-400">
                    Registrado: {new Date(d.created_at).toLocaleString('es-CO', { dateStyle:'short', timeStyle:'short' })}
                    {d.last_used_at && <> · Último uso: {new Date(d.last_used_at).toLocaleString('es-CO', { dateStyle:'short', timeStyle:'short' })}</>}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                  ${d.aprobado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {d.aprobado ? '● Aprobado' : '○ Pendiente'}
                </span>
                <div className="flex gap-2">
                  <button onClick={()=>toggleDispositivo(d.id)} disabled={busyDevice===d.id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50
                      ${d.aprobado
                        ? 'border border-stone-200 text-stone-500 hover:border-red-300 hover:text-red-600'
                        : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    {d.aprobado ? 'Revocar acceso' : '✓ Aprobar'}
                  </button>
                  <button onClick={()=>eliminarDispositivo(d.id)} disabled={busyDevice===d.id}
                    className="px-3 py-2 rounded-xl border border-stone-200 text-stone-400
                               hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Registro de accesos ───────────────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History size={20} className="text-red-800"/>
          <h2 className="text-xl font-black text-gray-900" style={{fontFamily:'Elms Sans, sans-serif'}}>
            Últimos accesos al panel de ventas
          </h2>
        </div>

        {accesos.length === 0 ? (
          <div className="text-center py-10 text-stone-400 bg-white rounded-2xl border border-stone-100">
            <Clock size={36} className="mx-auto mb-2 opacity-40"/>
            <p className="font-semibold text-sm">Sin registros todavía</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-400 uppercase tracking-wide border-b border-stone-100">
                  <th className="px-4 py-3 font-bold">Fecha</th>
                  <th className="px-4 py-3 font-bold">Local</th>
                  <th className="px-4 py-3 font-bold">Dispositivo</th>
                  <th className="px-4 py-3 font-bold">Resultado</th>
                  <th className="px-4 py-3 font-bold">IP</th>
                </tr>
              </thead>
              <tbody>
                {accesos.map(a => (
                  <tr key={a.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString('es-CO', { dateStyle:'short', timeStyle:'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-700">{a.pv_nombre || '—'}</td>
                    <td className="px-4 py-3 text-stone-500">{a.dispositivo_nombre || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap
                        ${a.exito ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {a.exito ? '✓' : '✗'} {a.motivo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 font-mono text-xs">{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
