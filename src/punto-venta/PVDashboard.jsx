import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { LogOut, RefreshCw, Clock, CheckCircle, Package, Bike, Volume2, VolumeX } from 'lucide-react'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Cancelado']
const STATUS_META = {
  'Pendiente':      { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
  'En preparación': { color: 'bg-blue-100   text-blue-800   border-blue-200',   icon: '👨‍🍳' },
  'Listo':          { color: 'bg-green-100  text-green-800  border-green-200',  icon: '✅' },
  'Cancelado':      { color: 'bg-red-100    text-red-700    border-red-200',    icon: '❌' },
}

export default function PVDashboard() {
  const navigate  = useNavigate()
  const pvData    = JSON.parse(localStorage.getItem('pv_data') || '{}')
  const [pedidos,  setPedidos]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('Pendiente')
  const [updating, setUpdating] = useState(null)
  const [soundOn,  setSoundOn]  = useState(() => localStorage.getItem('pv_sound') !== 'off')
  const [alerta,   setAlerta]   = useState(null)   // cantidad de pedidos nuevos detectados
  const soundOnRef  = useRef(soundOn)
  const audioCtxRef = useRef(null)
  const knownIdsRef = useRef(null)                 // ids ya vistos (null = primera carga)
  const alertaRef   = useRef(null)                 // timeout del aviso visual

  // El navegador solo permite sonido después de una interacción del usuario;
  // el clic del login ya cuenta, y por si acaso se desbloquea con el primer clic.
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (Ctx) audioCtxRef.current = new Ctx()
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }
    return audioCtxRef.current
  }

  // Timbre "din-don" repetido 4 veces, generado por el navegador (sin archivos).
  // Onda cuadrada a volumen alto: suena fuerte y penetrante, como campana de alarma.
  function playChime() {
    const ctx = getAudioCtx()
    if (!ctx) return
    const start = ctx.currentTime
    ;[0, 0.9, 1.8, 2.7].forEach(offset => {
      ;[[987.77, 0], [783.99, 0.35]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        const t = start + offset + delay
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.9, t + 0.02)
        gain.gain.setValueAtTime(0.9, t + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.55)
      })
    })
  }

  function toggleSound() {
    const next = !soundOn
    setSoundOn(next)
    soundOnRef.current = next
    localStorage.setItem('pv_sound', next ? 'on' : 'off')
    if (next) playChime()  // suena de una vez: confirma y desbloquea el audio
  }

  const fetchPedidos = useCallback(async () => {
    if (!pvData?.id) return
    try {
      const data = await api.puntosVenta.getPedidos(pvData.id)
      setPedidos(data)
      // Detectar pedidos nuevos desde la última consulta y avisar
      if (knownIdsRef.current) {
        const nuevos = data.filter(p => !knownIdsRef.current.has(p.id))
        if (nuevos.length > 0) {
          if (soundOnRef.current) playChime()
          setAlerta(nuevos.length)
          clearTimeout(alertaRef.current)
          alertaRef.current = setTimeout(() => setAlerta(null), 8000)
        }
      }
      knownIdsRef.current = new Set(data.map(p => p.id))
    } catch(err) {
      // Sesión expirada o dispositivo revocado → volver al login
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('pv_token')
        localStorage.removeItem('pv_data')
        navigate('/punto-venta')
        return
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [pvData?.id])

  useEffect(() => {
    const token = localStorage.getItem('pv_token')
    if (!token) { navigate('/punto-venta'); return }
    fetchPedidos()
    // Auto-refresh cada 15 segundos
    const interval = setInterval(fetchPedidos, 15000)
    // Desbloquear el audio con el primer clic en la página
    const unlock = () => getAudioCtx()
    window.addEventListener('click', unlock, { once: true })
    return () => {
      clearInterval(interval)
      clearTimeout(alertaRef.current)
      window.removeEventListener('click', unlock)
    }
  }, [])

  // Mostrar los pendientes en la pestaña del navegador
  useEffect(() => {
    const pend = pedidos.filter(p => p.status === 'Pendiente').length
    document.title = pend > 0 ? `(${pend}) Pedidos — Bon Pan` : 'Panel de Ventas — Bon Pan'
    return () => { document.title = 'Bon Pan – Panadería Artesanal' }
  }, [pedidos])

  function logout() {
    localStorage.removeItem('pv_token')
    localStorage.removeItem('pv_data')
    navigate('/punto-venta')
  }

  async function cambiarEstado(pedidoId, status) {
    setUpdating(pedidoId)
    try {
      await api.pedidos.setStatus(pedidoId, status)
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status } : p))
    } catch(err) {
      alert('Error al cambiar estado')
    } finally {
      setUpdating(null)
    }
  }

  const filtered  = pedidos.filter(p => filter === 'Todos' || p.status === filter)
  const pendientes = pedidos.filter(p => p.status === 'Pendiente').length
  const enProc     = pedidos.filter(p => p.status === 'Preparación').length

  return (
    <div className="min-h-screen bg-gray-50" style={{textAlign:'left'}}>
      {/* Aviso de pedido nuevo */}
      {alerta && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950 text-white
                        px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2
                        font-bold text-sm animate-bounce">
          🔔 ¡{alerta === 1 ? 'Nuevo pedido' : `${alerta} pedidos nuevos`}!
        </div>
      )}

      {/* Header */}
      <header className="bg-red-950 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 object-contain rounded-lg"/>
          <div>
            <p className="font-black text-base" style={{fontFamily:'Elms Sans, sans-serif'}}>{pvData.nombre}</p>
            <p className="text-red-300 text-xs font-medium">Panel de Ventas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleSound}
            title={soundOn ? 'Silenciar aviso de pedidos nuevos' : 'Activar sonido de pedidos nuevos'}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors
              ${soundOn ? 'bg-red-900 hover:bg-red-800' : 'bg-red-900/50 text-red-300 hover:bg-red-800'}`}>
            {soundOn ? <Volume2 size={15}/> : <VolumeX size={15}/>}
          </button>
          <button onClick={fetchPedidos}
            className="flex items-center gap-2 bg-red-900 hover:bg-red-800 px-3 py-2 rounded-xl
                       text-sm font-semibold transition-colors">
            <RefreshCw size={15}/> Actualizar
          </button>
          <button onClick={logout}
            className="flex items-center gap-2 bg-red-900 hover:bg-red-800 px-3 py-2 rounded-xl
                       text-sm font-semibold transition-colors">
            <LogOut size={15}/> Salir
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total hoy',     value: pedidos.length,                                       icon: <Package size={20}/>,    color: 'bg-blue-50 text-blue-700'   },
            { label: 'Pendientes',    value: pendientes,                                            icon: <Clock size={20}/>,      color: 'bg-yellow-50 text-yellow-700'},
            { label: 'Listos',        value: pedidos.filter(p=>p.status==='Listo').length,         icon: <CheckCircle size={20}/>, color: 'bg-green-50 text-green-700' },
            { label: 'Entregados',    value: pedidos.filter(p=>p.status==='Entregado').length,     icon: <Bike size={20}/>,        color: 'bg-stone-50 text-stone-600'  },
          ].map(k => (
            <div key={k.label} className={`rounded-2xl p-5 ${k.color} border border-current/10`}>
              <div className="mb-2 opacity-70">{k.icon}</div>
              <p className="text-3xl font-black">{k.value}</p>
              <p className="text-sm font-semibold opacity-70 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {['Todos', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={()=>setFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors
                ${filter===s ? 'bg-red-950 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-red-300'}`}>
              {STATUS_META[s]?.icon} {s}
              {s !== 'Todos' && (
                <span className="ml-1.5 bg-current/10 px-1.5 py-0.5 rounded-full text-[10px]">
                  {pedidos.filter(p=>p.status===s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i=><div key={i} className="bg-white rounded-2xl h-32 animate-pulse"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400 bg-white rounded-2xl">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-semibold">No hay pedidos con este estado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(pedido => {
              const meta = STATUS_META[pedido.status] || STATUS_META['Pendiente']
              return (
                <div key={pedido.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  {/* Header del pedido */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center font-black text-red-700 text-sm">
                        #{pedido.id}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{pedido.customer?.name || pedido.cliente_name}</p>
                        <p className="text-stone-400 text-xs">{pedido.customer?.phone || pedido.cliente_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
                        {meta.icon} {pedido.status}
                      </span>
                      <p className="font-black text-red-800">${Number(pedido.total).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="px-5 py-3 border-b border-stone-50">
                    <div className="flex flex-wrap gap-2">
                      {pedido.items?.map(i => (
                        <span key={i.id} className="bg-stone-50 text-stone-600 px-3 py-1.5 rounded-xl text-xs font-medium">
                          {i.emoji} {i.name} ×{i.qty}
                        </span>
                      ))}
                    </div>
                    {pedido.tipo_entrega === 'domicilio' && (
                      <p className="text-stone-500 text-xs mt-2 font-semibold">
                        🛵 Domicilio{pedido.zona_entrega ? ` — ${pedido.zona_entrega}` : ''}
                        {pedido.direccion_entrega ? ` · ${pedido.direccion_entrega}` : ''}
                        {Number(pedido.costo_domicilio) > 0 ? ` · $${Number(pedido.costo_domicilio).toLocaleString()}` : ''}
                      </p>
                    )}
                    {pedido.tipo_entrega === 'retiro' && (
                      <p className="text-stone-500 text-xs mt-2 font-semibold">🏪 Retiro en tienda</p>
                    )}
                    {pedido.notes && (
                      <p className="text-stone-400 text-xs mt-2">📝 {pedido.notes}</p>
                    )}
                  </div>

                  {/* Cambiar estado */}
                  <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mr-1">Cambiar a:</p>
                    {STATUS_OPTIONS.filter(s => s !== pedido.status && s !== 'Cancelado').map(s => (
                      <button key={s} onClick={()=>cambiarEstado(pedido.id, s)}
                        disabled={updating === pedido.id}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all
                          disabled:opacity-50 ${STATUS_META[s].color}`}>
                        {STATUS_META[s].icon} {s}
                      </button>
                    ))}
                    <button onClick={()=>cambiarEstado(pedido.id,'Cancelado')}
                      disabled={updating===pedido.id}
                      className="px-4 py-1.5 rounded-full text-xs font-bold border-2 border-red-200
                                 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto">
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 bg-white border border-stone-200 rounded-full px-4 py-2
                      text-xs text-stone-400 font-medium shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
        Se actualiza cada 15s {soundOn ? '· 🔔 sonido activo' : '· 🔕 silenciado'}
      </div>
    </div>
  )
}
