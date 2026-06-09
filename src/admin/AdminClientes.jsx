import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'

const STATUS_COLORS = {
  'Pendiente':      'bg-yellow-100 text-yellow-700',
  'En preparación': 'bg-blue-100   text-blue-700',
  'Listo':          'bg-green-100  text-green-700',
  'Entregado':      'bg-stone-100  text-stone-500',
  'Cancelado':      'bg-red-100    text-red-600',
}

export default function AdminClientes() {
  const { clients, loading } = useApp()
  const [selected,     setSelected]     = useState(null)
  const [clientOrders, setClientOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  async function selectClient(client) {
    if (selected?.id === client.id) { setSelected(null); setClientOrders([]); return }
    setSelected(client)
    setLoadingOrders(true)
    try {
      const pedidos = await api.clientes.getPedidos(client.id)
      setClientOrders(pedidos)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOrders(false)
    }
  }

  if (loading.clients) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center text-stone-400">
          <div className="text-4xl mb-3 animate-pulse">👤</div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-black text-red-900" style={{fontFamily:'Elms Sans, sans-serif'}}>Clientes</h1>
        <p className="text-stone-500 text-sm mt-1">Historial de compras y comportamiento por cliente</p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">👤</div>
          <p>Aún no hay clientes registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Lista de clientes */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">{clients.length} clientes</p>
            {clients.map(c => (
              <button key={c.id} onClick={() => selectClient(c)}
                className={`w-full text-left rounded-2xl p-4 shadow-sm border-2 transition-all
                  ${selected?.id === c.id ? 'border-red-500 bg-red-50' : 'border-transparent bg-white hover:border-red-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-black flex items-center justify-center text-lg shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800 truncate">{c.name}</p>
                    <p className="text-xs text-stone-400">{c.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-red-800 text-sm">${Number(c.total_gastado).toLocaleString()}</p>
                    <p className="text-xs text-stone-400">{c.total_pedidos} pedido{c.total_pedidos != 1 ? 's' : ''}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detalle del cliente */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-stone-400 h-full flex flex-col items-center justify-center">
                <div className="text-5xl mb-3">👈</div>
                <p>Selecciona un cliente para ver su historial</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 font-black text-2xl flex items-center justify-center">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-red-900">{selected.name}</h2>
                      <p className="text-stone-500 text-sm">{selected.phone}</p>
                      <p className="text-stone-400 text-xs">Cliente desde {new Date(selected.created_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total gastado',  value: `$${Number(selected.total_gastado).toLocaleString()}` },
                      { label: 'Pedidos',        value: selected.total_pedidos },
                      { label: 'Ticket prom.',   value: `$${Math.round(selected.ticket_promedio).toLocaleString()}` },
                    ].map(s => (
                      <div key={s.label} className="bg-red-50 rounded-xl p-3 text-center">
                        <p className="font-black text-red-900 text-lg">{s.value}</p>
                        <p className="text-stone-500 text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial pedidos */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="font-black text-red-900 mb-4">Historial de Pedidos</h3>
                  {loadingOrders ? (
                    <p className="text-stone-400 text-sm text-center py-6 animate-pulse">Cargando pedidos...</p>
                  ) : clientOrders.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-6">Sin pedidos registrados.</p>
                  ) : (
                    <div className="space-y-4">
                      {clientOrders.map(o => (
                        <div key={o.id} className="border border-stone-100 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-stone-800 text-sm">Pedido #{o.id}</p>
                              <p className="text-xs text-stone-400">{new Date(o.created_at).toLocaleString('es-CO')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                              <span className="font-bold text-red-800 text-sm">${Number(o.total).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {o.items.map(i => (
                              <span key={i.id} className="bg-stone-50 text-stone-600 px-2 py-1 rounded-lg text-xs">
                                {i.emoji} {i.name} ×{i.qty}
                              </span>
                            ))}
                          </div>
                          {o.notes && <p className="text-xs text-stone-400 mt-2">📝 {o.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
