import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronDown, ChevronUp, Clock, Copy, CalendarDays, X } from 'lucide-react'

/** Formatea timestamp ISO/Postgres a español con hora */
function fmtDate(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d)) return String(raw)
  return d.toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  })
}

/** Convierte timestamp a YYYY-MM-DD para comparar con input date */
function toDateStr(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d)) return ''
  return d.toISOString().slice(0, 10)
}

const STATUS_OPTIONS = ['Pendiente', 'En preparación', 'Listo', 'Cancelado']
const STATUS_COLORS  = {
  'Pendiente':      'bg-yellow-100 text-yellow-700',
  'En preparación': 'bg-blue-100   text-blue-700',
  'Listo':          'bg-green-100  text-green-700',
  'Cancelado':      'bg-red-100    text-red-600',
}
const STATUS_ICONS = {
  'Pendiente':      '🕐',
  'En preparación': '👨‍🍳',
  'Listo':          '📦',
  'Cancelado':      '❌',
}

export default function AdminPedidos() {
  const { orders, updateOrderStatus, loading } = useApp()
  const [filter,    setFilter]    = useState('Todos')
  const [expanded,  setExpanded]  = useState(null)
  const [search,    setSearch]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')

  const hasDateFilter = dateFrom || dateTo

  function clearDate() { setDateFrom(''); setDateTo('') }

  const filtered = useMemo(() => orders.filter(o => {
    const matchStatus = filter === 'Todos' || o.status === filter
    const matchSearch = o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        String(o.id).includes(search)
    const orderDate = toDateStr(o.created_at)
    const matchFrom = !dateFrom || orderDate >= dateFrom
    const matchTo   = !dateTo   || orderDate <= dateTo
    return matchStatus && matchSearch && matchFrom && matchTo
  }), [orders, filter, search, dateFrom, dateTo])

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
        <h1 className="text-3xl font-black text-red-900" style={{fontFamily:'Elms Sans, sans-serif'}}>Pedidos</h1>
        <p className="text-stone-500 text-sm mt-1">Trazabilidad completa de cada pedido</p>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        {/* Búsqueda + estados */}
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

        {/* Filtro por intervalo de fechas */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-stone-400">
            <CalendarDays size={15} />
            <span className="text-xs font-semibold uppercase tracking-wider">Período:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-stone-200 rounded-full px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-red-400 bg-white" />
            <span className="text-xs text-stone-400">hasta</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={e => setDateTo(e.target.value)}
              className="border border-stone-200 rounded-full px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-red-400 bg-white" />
          </div>
          {hasDateFilter && (
            <button onClick={clearDate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors">
              <X size={11} /> Limpiar
            </button>
          )}
          <span className="text-xs text-stone-400">
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
          </span>
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
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-red-900">#{order.id}</p>
                      <button
                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(String(order.id)) }}
                        title="Copiar código"
                        className="text-stone-300 hover:text-stone-600 transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <Clock size={11} />
                      <span>{fmtDate(order.created_at)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{order.customer.name}</p>
                    <p className="text-xs text-stone-400">{order.customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  {order.payment_status && (
                    <span title={order.payment_method ? `Método: ${order.payment_method}` : undefined}
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${order.payment_status === 'Aprobado' ? 'bg-green-100 text-green-700'
                          : order.payment_status === 'Pendiente' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-600'}`}>
                      💳 {order.payment_status === 'Aprobado' ? 'Pagado' : `Pago ${order.payment_status.toLowerCase()}`}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                    {STATUS_ICONS[order.status]} {order.status}
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
                    {/* Entrega */}
                    {order.tipo_entrega && (
                      <div className="mt-3 bg-stone-50 rounded-xl p-3 text-sm text-stone-600">
                        {order.tipo_entrega === 'domicilio' ? (
                          <>
                            🛵 <span className="font-medium">Domicilio (entrega inmediata)</span>
                            {order.zona_entrega && <> — <strong>{order.zona_entrega}</strong></>}
                            {order.direccion_entrega && ` · ${order.direccion_entrega}`}
                            {Number(order.costo_domicilio) > 0 &&
                              ` · $${Number(order.costo_domicilio).toLocaleString()}`}
                          </>
                        ) : order.tipo_entrega === 'ruta' ? (
                          <>
                            🚚 <span className="font-medium">Entrega en ruta (día siguiente)</span>
                            {order.zona_entrega && <> — <strong>{order.zona_entrega}</strong></>}
                            {order.direccion_entrega && ` · ${order.direccion_entrega}`}
                            {' '}· sin costo de domicilio
                          </>
                        ) : (
                          <>🏪 <span className="font-medium">Retiro en tienda</span></>
                        )}
                      </div>
                    )}
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
                      {(order.statusHistory?.length
                        ? order.statusHistory
                        : [{ status: order.status, timestamp: order.created_at }]
                      ).map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0 mt-0.5" />
                            {i < (order.statusHistory?.length || 1) - 1 && (
                              <div className="w-0.5 h-5 bg-stone-200" />
                            )}
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[h.status]}`}>{STATUS_ICONS[h.status]} {h.status}</span>
                            <p className="text-xs text-stone-400 mt-0.5">{fmtDate(h.timestamp)}</p>
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
