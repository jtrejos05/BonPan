import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado']
const STATUS_COLORS  = {
  'Pendiente':      'bg-yellow-100 text-yellow-700',
  'En preparación': 'bg-blue-100   text-blue-700',
  'Listo':          'bg-green-100  text-green-700',
  'Entregado':      'bg-stone-100  text-stone-500',
  'Cancelado':      'bg-red-100    text-red-600',
}

export default function AdminPedidos() {
  const { orders, updateOrderStatus, loading } = useApp()
  const [filter, setFilter]   = useState('Todos')
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch]   = useState('')

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'Todos' || o.status === filter
    const matchSearch = o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                        String(o.id).includes(search)
    return matchStatus && matchSearch
  })

  if (loading.orders) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="text-center text-stone-400">
        <div className="text-4xl mb-3 animate-pulse">📋</div>
        <p>Cargando pedidos...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-black text-red-900" style={{fontFamily:'Montserrat,sans-serif'}}>Pedidos</h1>
        <p className="text-stone-500 text-sm mt-1">Trazabilidad completa de cada pedido</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por cliente o ID..."
          className="border border-stone-200 rounded-full px-4 py-2 text-sm text-stone-700 focus:outline-none focus:border-red-400 bg-white"
        />
        <div className="flex gap-2 flex-wrap">
          {['Todos', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${filter === s ? 'bg-red-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-red-400'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">📋</div>
          <p>No hay pedidos con ese filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 p-5 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-red-900">#{order.id}</p>
                    <p className="text-xs text-stone-400">{order.date}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{order.customer.name}</p>
                    <p className="text-xs text-stone-400">{order.customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-red-800">${order.total.toLocaleString()}</span>
                  {expanded === order.id ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                </div>
              </div>

              {/* Detail */}
              {expanded === order.id && (
                <div className="border-t border-stone-100 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Products */}
                  <div>
                    <h3 className="font-bold text-stone-700 text-sm mb-3">Productos</h3>
                    <div className="space-y-2">
                      {order.items.map(i => (
                        <div key={i.id} className="flex justify-between text-sm">
                          <span className="text-stone-600">{i.emoji} {i.name} × {i.qty}</span>
                          <span className="font-semibold text-stone-700">${(i.price * i.qty).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-red-900 text-sm">
                        <span>Total</span>
                        <span>${order.total.toLocaleString()}</span>
                      </div>
                    </div>
                    {order.customer.notes && (
                      <div className="mt-3 bg-amber-50 rounded-xl p-3 text-sm text-stone-600">
                        📝 <span className="font-medium">Nota:</span> {order.customer.notes}
                      </div>
                    )}
                  </div>

                  {/* Timeline + status change */}
                  <div>
                    <h3 className="font-bold text-stone-700 text-sm mb-3">Historial de Estado</h3>
                    <div className="space-y-2 mb-4">
                      {(order.statusHistory || [{ status: order.status, timestamp: order.date }]).map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0 mt-0.5" />
                            {i < (order.statusHistory?.length || 1) - 1 && (
                              <div className="w-0.5 h-5 bg-stone-200" />
                            )}
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[h.status]}`}>{h.status}</span>
                            <p className="text-xs text-stone-400 mt-0.5">{h.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5">Cambiar estado</label>
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
