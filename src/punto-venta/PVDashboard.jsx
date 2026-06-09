import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { LogOut, RefreshCw, Clock, CheckCircle, Package, Bike } from 'lucide-react'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']
const STATUS_META = {
  'Pendiente':      { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
  'En preparación': { color: 'bg-blue-100   text-blue-800   border-blue-200',   icon: '👨‍🍳' },
  'Listo':          { color: 'bg-green-100  text-green-800  border-green-200',  icon: '✅' },
  'Entregado':      { color: 'bg-stone-100  text-stone-600  border-stone-200',  icon: '📦' },
  'Cancelado':      { color: 'bg-red-100    text-red-700    border-red-200',    icon: '❌' },
}

export default function PVDashboard() {
  const navigate  = useNavigate()
  const pvData    = JSON.parse(localStorage.getItem('pv_data') || '{}')
  const [pedidos,  setPedidos]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('Pendiente')
  const [updating, setUpdating] = useState(null)

  const fetchPedidos = useCallback(async () => {
    if (!pvData?.id) return
    try {
      const data = await api.puntosVenta.getPedidos(pvData.id)
      setPedidos(data)
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [pvData?.id])

  useEffect(() => {
    const token = localStorage.getItem('pv_token')
    if (!token) { navigate('/punto-venta'); return }
    fetchPedidos()
    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchPedidos, 30000)
    return () => clearInterval(interval)
  }, [])

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
        Se actualiza cada 30s
      </div>
    </div>
  )
}
