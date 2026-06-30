import { useApp } from '../context/AppContext'
import { TrendingUp, ShoppingBag, Clock, AlertTriangle } from 'lucide-react'

const STATUS_COLORS = {
  'Pendiente':      'bg-yellow-100 text-yellow-700 border-yellow-200',
  'En preparación': 'bg-blue-100   text-blue-700   border-blue-200',
  'Listo':          'bg-green-100  text-green-700  border-green-200',
  'Cancelado':      'bg-red-100    text-red-600    border-red-200',
}

export default function AdminDashboard() {
  const { orders, products, activityLog } = useApp()

  const revenue    = orders.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0)
  const pending    = orders.filter(o => o.status === 'Pendiente').length
  const inProgress = orders.filter(o => o.status === 'En preparación').length
  const delivered  = orders.filter(o => o.status === 'Listo').length
  const lowStock   = products.filter(p => p.stock <= 5).length

  const productCounts = {}
  orders.forEach(o => o.items?.forEach(i => {
    productCounts[i.name] = (productCounts[i.name] || 0) + i.qty
  }))
  const topProducts  = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const recentOrders = orders.slice(0, 5)

  const kpis = [
    { label: 'Ingresos Totales', value: `$${revenue.toLocaleString()}`, icon: <TrendingUp size={22} />, color: 'bg-green-500',  light: 'bg-green-50 text-green-700'  },
    { label: 'Total Pedidos',    value: orders.length,                   icon: <ShoppingBag size={22} />, color: 'bg-blue-500',   light: 'bg-blue-50 text-blue-700'    },
    { label: 'Pendientes',       value: pending,                          icon: <Clock size={22} />,       color: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-700'},
    { label: 'Stock Bajo',       value: lowStock,                         icon: <AlertTriangle size={22}/>, color: 'bg-red-500',    light: 'bg-red-50 text-red-700'      },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900" style={{fontFamily:'Elms Sans, sans-serif'}}>
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Vista general del negocio en tiempo real</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">Hoy</p>
          <p className="font-bold text-gray-700 text-sm">{new Date().toLocaleDateString('es-CO', {weekday:'long', day:'numeric', month:'long'})}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${k.color} flex items-center justify-center text-white mb-4 shadow-sm`}>
              {k.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{k.value}</p>
            <p className="text-gray-400 text-sm font-medium mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Status pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes',     val: pending,    key: 'Pendiente'      },
          { label: 'En preparación', val: inProgress, key: 'En preparación' },
          { label: 'Listos',         val: delivered,  key: 'Listo'          },
          { label: 'Cancelados',     val: orders.filter(o=>o.status==='Cancelado').length, key: 'Cancelado' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-4 border ${STATUS_COLORS[s.key]} flex items-center justify-between`}>
            <span className="text-sm font-bold">{s.label}</span>
            <span className="text-2xl font-black">{s.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <h2 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2"
              style={{fontFamily:'Elms Sans, sans-serif'}}>
            <ShoppingBag size={20} className="text-red-500" /> Últimos Pedidos
          </h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <ShoppingBag size={40} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Sin pedidos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 font-black text-sm flex items-center justify-center">
                      {o.customer?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{o.customer?.name}</p>
                      <p className="text-xs text-gray-400">{o.date || new Date(o.created_at).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                    <span className="font-black text-sm text-red-700">${Number(o.total).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <h2 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2"
              style={{fontFamily:'Elms Sans, sans-serif'}}>
            <TrendingUp size={20} className="text-red-500" /> Más Vendidos
          </h2>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <TrendingUp size={40} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Sin datos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0
                    ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-stone-400' : i === 2 ? 'bg-orange-400' : 'bg-red-100 text-red-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-gray-700 truncate">{name}</span>
                      <span className="text-gray-400 font-semibold shrink-0 ml-2">{qty} uds</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                        style={{ width: `${(qty / (topProducts[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
        <h2 className="font-black text-gray-900 text-lg mb-5"
            style={{fontFamily:'Elms Sans, sans-serif'}}>Actividad Reciente</h2>
        {activityLog.length === 0 ? (
          <p className="text-gray-300 text-sm text-center py-6 font-medium">Sin actividad registrada</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {activityLog.slice(0, 10).map(e => (
              <div key={e.id} className="flex gap-3 items-start py-2.5 border-b border-stone-50 last:border-0">
                <span className="text-xl shrink-0">
                  {{ pedido:'🧾', estado:'🔄', producto:'📦', carrito:'🛒', sistema:'🔐' }[e.type] || '📌'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">{e.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    {e.timestamp || new Date(e.created_at).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
