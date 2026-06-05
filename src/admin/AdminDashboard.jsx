import { useApp } from '../context/AppContext'

const STATUS_COLORS = {
  'Pendiente':      'bg-yellow-100 text-yellow-700',
  'En preparación': 'bg-blue-100 text-blue-700',
  'Listo':          'bg-green-100 text-green-700',
  'Entregado':      'bg-stone-100 text-stone-500',
  'Cancelado':      'bg-red-100 text-red-600',
}

export default function AdminDashboard() {
  const { orders, products, activityLog } = useApp()

  const revenue    = orders.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0)
  const pending    = orders.filter(o => o.status === 'Pendiente').length
  const inProgress = orders.filter(o => o.status === 'En preparación').length
  const delivered  = orders.filter(o => o.status === 'Entregado').length
  const lowStock   = products.filter(p => p.stock <= 5).length

  // Top 5 productos más pedidos
  const productCounts = {}
  orders.forEach(o => o.items.forEach(i => {
    productCounts[i.name] = (productCounts[i.name] || 0) + i.qty
  }))
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-red-900" style={{fontFamily:'Montserrat,sans-serif'}}>Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Vista general del negocio en tiempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos Totales',  value: `$${revenue.toLocaleString()}`, icon: '💰', color: 'bg-green-50  border-green-200',  text: 'text-green-800' },
          { label: 'Total Pedidos',     value: orders.length,                  icon: '📋', color: 'bg-blue-50   border-blue-200',    text: 'text-blue-800'  },
          { label: 'Pendientes',        value: pending,                         icon: '⏳', color: 'bg-yellow-50 border-yellow-200',  text: 'text-yellow-800'},
          { label: 'Stock Bajo',        value: lowStock,                        icon: '⚠️', color: 'bg-red-50    border-red-200',     text: 'text-red-800'   },
        ].map(k => (
          <div key={k.label} className={`rounded-2xl border p-5 ${k.color}`}>
            <div className="text-3xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-black ${k.text}`}>{k.value}</div>
            <div className="text-stone-500 text-sm font-medium mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes',      val: pending,    color: 'bg-yellow-100 text-yellow-800' },
          { label: 'En preparación',  val: inProgress, color: 'bg-blue-100 text-blue-800'    },
          { label: 'Entregados',      val: delivered,  color: 'bg-green-100 text-green-800'  },
          { label: 'Cancelados',      val: orders.filter(o=>o.status==='Cancelado').length, color: 'bg-red-100 text-red-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 flex items-center justify-between ${s.color}`}>
            <span className="text-sm font-semibold">{s.label}</span>
            <span className="text-xl font-black">{s.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-black text-red-900 text-lg mb-4">Últimos Pedidos</h2>
          {recentOrders.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">Sin pedidos aún</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-stone-800">{o.customer.name}</p>
                    <p className="text-xs text-stone-400">{o.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                    <span className="font-bold text-sm text-red-800">${o.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-black text-red-900 text-lg mb-4">Productos Más Pedidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([name, qty], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-black flex items-center justify-center shrink-0">{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-stone-700">{name}</span>
                      <span className="text-stone-500 font-medium">{qty} uds</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(qty / (topProducts[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-black text-red-900 text-lg mb-4">Actividad Reciente</h2>
        {activityLog.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">Sin actividad registrada</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {activityLog.slice(0, 10).map(e => (
              <div key={e.id} className="flex gap-3 items-start py-1.5 border-b border-stone-50 last:border-0">
                <span className="text-lg shrink-0">
                  {{ pedido: '🧾', estado: '🔄', producto: '📦', carrito: '🛒', sistema: '🔐' }[e.type] || '📌'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700">{e.description}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{e.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
