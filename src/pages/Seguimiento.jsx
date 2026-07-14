import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import { Search, RefreshCw, CheckCircle2, Clock, ChefHat, PackageCheck, Bike, XCircle } from 'lucide-react'

const PASOS = ['Pendiente', 'En preparación', 'Listo', 'Entregado']

function labelPaso(paso, tipoEntrega) {
  if (paso === 'Pendiente')       return 'Pedido recibido'
  if (paso === 'En preparación')  return 'En preparación'
  if (paso === 'Listo') {
    if (tipoEntrega === 'domicilio') return 'Listo — sale en camino'
    if (tipoEntrega === 'ruta')      return 'Listo — va en la ruta'
    return 'Listo para recoger'
  }
  return 'Entregado'
}

const ICONOS = {
  'Pendiente':      Clock,
  'En preparación': ChefHat,
  'Listo':          PackageCheck,
  'Entregado':      Bike,
}

function fmtHora(raw) {
  if (!raw) return null
  const d = new Date(raw)
  if (isNaN(d)) return null
  return d.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function Seguimiento() {
  const [params] = useSearchParams()
  const [numero,   setNumero]   = useState(params.get('pedido') || '')
  const [telefono, setTelefono] = useState(params.get('tel') || '')
  const [pedido,   setPedido]   = useState(null)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const intervalRef = useRef(null)

  const consultar = useCallback(async (id, tel, silencioso = false) => {
    if (!id || !tel) return
    if (!silencioso) { setLoading(true); setError('') }
    try {
      const data = await api.pedidos.seguimiento(id, tel)
      setPedido(data)
      setError('')
    } catch (err) {
      if (!silencioso) { setError(err.message); setPedido(null) }
    } finally {
      if (!silencioso) setLoading(false)
    }
  }, [])

  // Consulta automática si llega con los datos en la URL (desde la confirmación)
  useEffect(() => {
    if (params.get('pedido') && params.get('tel')) {
      consultar(params.get('pedido'), params.get('tel'))
    }
  }, [])

  // Auto-actualización cada 20s mientras el pedido siga en proceso
  useEffect(() => {
    clearInterval(intervalRef.current)
    if (pedido && !['Entregado', 'Cancelado'].includes(pedido.status)) {
      intervalRef.current = setInterval(() => consultar(pedido.id, telefono, true), 20000)
    }
    return () => clearInterval(intervalRef.current)
  }, [pedido?.id, pedido?.status])

  function handleSubmit(e) {
    e.preventDefault()
    consultar(numero.trim(), telefono.trim())
  }

  const pasoActual = pedido ? PASOS.indexOf(pedido.status) : -1
  const horaDe = (paso) => {
    const h = pedido?.statusHistory?.filter(x => x.status === paso).pop()
    return h ? fmtHora(h.changed_at) : null
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]" style={{ fontFamily: 'Elms Sans, sans-serif' }}>
      {/* Header */}
      <div className="bg-red-950 pt-14 sm:pt-16 pb-0 text-center relative overflow-hidden">
        <div className="relative z-10 pb-10 sm:pb-12 px-4">
          <p className="text-red-400 text-xs tracking-[0.4em] uppercase font-semibold mb-2 sm:mb-3">Sigue tu pedido</p>
          <h1 className="text-3xl sm:text-5xl text-white">¿Cómo va mi pedido?</h1>
        </div>
        <svg viewBox="0 0 1440 50" className="w-full block" preserveAspectRatio="none">
          <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="#faf7f2" />
        </svg>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Formulario de consulta */}
        <form onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-1.5">
                Número de pedido
              </label>
              <input value={numero} onChange={e => setNumero(e.target.value)} required
                inputMode="numeric" placeholder="Ej: 123"
                className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                           font-bold focus:outline-none focus:border-red-800 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-1.5">
                Teléfono del pedido
              </label>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} required
                type="tel" placeholder="300 000 0000"
                className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                           font-medium focus:outline-none focus:border-red-800 transition-colors" />
            </div>
          </div>
          {error && (
            <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase py-4
                       rounded-xl hover:bg-red-900 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2">
            <Search size={15} /> {loading ? 'Consultando...' : 'Consultar mi pedido'}
          </button>
        </form>

        {/* Resultado */}
        {pedido && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Encabezado del pedido */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-black text-red-950 text-xl">Pedido #{pedido.id}</p>
                <p className="text-stone-400 text-xs">{fmtHora(pedido.created_at)}</p>
              </div>
              <p className="font-black text-red-800 text-xl">${Number(pedido.total).toLocaleString()}</p>
            </div>

            {/* Estado del pago en línea */}
            {pedido.payment_status && (
              <div className={`rounded-xl px-4 py-3 text-sm font-semibold border
                ${pedido.payment_status === 'Aprobado'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                💳 Pago en línea: {pedido.payment_status}
                {pedido.payment_status === 'Pendiente' && ' — tu pedido entra a preparación al confirmarse el pago'}
              </div>
            )}

            {pedido.status === 'Cancelado' ? (
              <div className="text-center py-6">
                <XCircle size={44} className="mx-auto text-red-400 mb-3" />
                <p className="font-black text-red-950 text-lg">Este pedido fue cancelado</p>
                <p className="text-stone-400 text-sm mt-1">
                  Si tienes dudas, <a href="https://wa.me/573053067179" target="_blank" rel="noopener noreferrer"
                    className="text-red-700 font-bold hover:underline">escríbenos por WhatsApp</a>.
                </p>
              </div>
            ) : (
              /* Línea de tiempo */
              <div className="space-y-0">
                {PASOS.map((paso, i) => {
                  const Icono = ICONOS[paso]
                  const completado = pasoActual > i
                  const actual     = pasoActual === i
                  const hora       = horaDe(paso)
                  return (
                    <div key={paso} className="flex gap-4">
                      {/* Columna del ícono + línea */}
                      <div className="flex flex-col items-center">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0
                          ${completado ? 'bg-green-500 border-green-500 text-white'
                            : actual ? 'bg-red-950 border-red-950 text-white animate-pulse'
                            : 'bg-white border-stone-200 text-stone-300'}`}>
                          {completado ? <CheckCircle2 size={22} /> : <Icono size={20} />}
                        </div>
                        {i < PASOS.length - 1 && (
                          <div className={`w-0.5 h-8 ${pasoActual > i ? 'bg-green-400' : 'bg-stone-200'}`} />
                        )}
                      </div>
                      {/* Texto */}
                      <div className="pb-4 pt-1.5">
                        <p className={`font-bold text-sm
                          ${completado ? 'text-green-600' : actual ? 'text-red-950' : 'text-stone-300'}`}>
                          {labelPaso(paso, pedido.tipo_entrega)}
                          {actual && <span className="ml-2 text-xs font-semibold text-red-500">● ahora</span>}
                        </p>
                        {(completado || actual) && hora && (
                          <p className="text-stone-400 text-xs mt-0.5">{hora}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Datos de entrega */}
            <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600">
              {pedido.tipo_entrega === 'retiro' ? (
                <p>🏪 <strong>Retiro en tienda</strong> — {pedido.punto_venta_nombre}
                  {pedido.punto_venta_direccion && ` · ${pedido.punto_venta_direccion}`}</p>
              ) : pedido.tipo_entrega === 'ruta' ? (
                <p>🚚 <strong>Entrega en ruta</strong> — te llega mañana en {pedido.direccion_entrega}
                  {pedido.zona_entrega && `, ${pedido.zona_entrega}`}</p>
              ) : pedido.tipo_entrega === 'domicilio' ? (
                <p>🛵 <strong>Domicilio</strong> — {pedido.direccion_entrega}
                  {pedido.zona_entrega && `, ${pedido.zona_entrega}`}</p>
              ) : null}
            </div>

            {/* Productos */}
            <div className="space-y-1.5">
              {pedido.items?.map((it, i) => (
                <div key={i} className="flex justify-between text-sm text-stone-500">
                  <span>{it.emoji} {it.name} ×{it.qty}</span>
                  <span className="font-semibold">${(it.price * it.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Pie */}
            {!['Entregado', 'Cancelado'].includes(pedido.status) && (
              <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
                <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
                Se actualiza solo cada 20 segundos — puedes dejar esta página abierta
              </p>
            )}
          </div>
        )}

        <p className="text-center text-sm text-stone-400">
          ¿Aún no has pedido? <Link to="/menu" className="text-red-700 font-bold hover:underline">Ver el menú →</Link>
        </p>
      </div>
    </div>
  )
}
