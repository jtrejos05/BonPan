import { useApp } from '../context/AppContext'
import { useState } from 'react'

const TYPE_META = {
  pedido:   { label: 'Pedido',    icon: '🧾', color: 'bg-blue-100  text-blue-700'   },
  estado:   { label: 'Estado',    icon: '🔄', color: 'bg-purple-100 text-purple-700' },
  producto: { label: 'Producto',  icon: '📦', color: 'bg-orange-100 text-orange-700' },
  carrito:  { label: 'Carrito',   icon: '🛒', color: 'bg-green-100  text-green-700'  },
  sistema:  { label: 'Sistema',   icon: '🔐', color: 'bg-stone-100  text-stone-600'  },
}

export default function AdminActividad() {
  const { activityLog } = useApp()
  const [filter, setFilter] = useState('todos')

  const filtered = filter === 'todos'
    ? activityLog
    : activityLog.filter(e => e.type === filter)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-3xl font-black text-red-900" style={{fontFamily:'Elms Sans, sans-serif'}}>Log de Actividad</h1>
        <p className="text-stone-500 text-sm mt-1">Registro completo de todas las acciones del módulo de clientes y admin</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('todos')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
            ${filter === 'todos' ? 'bg-red-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-red-400'}`}>
          Todos ({activityLog.length})
        </button>
        {Object.entries(TYPE_META).map(([key, meta]) => {
          const count = activityLog.filter(e => e.type === key).length
          return (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${filter === key ? 'bg-red-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-red-400'}`}>
              {meta.icon} {meta.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Log */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-3">📭</div>
          <p>No hay actividad registrada aún.</p>
          <p className="text-sm mt-1">Las acciones aparecerán aquí en tiempo real.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-50">
            {filtered.map((e, idx) => {
              const meta = TYPE_META[e.type] || TYPE_META.sistema
              return (
                <div key={e.id} className="flex items-start gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                  <span className="text-2xl shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      <p className="text-sm font-medium text-stone-700">{e.description}</p>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{e.timestamp}</p>
                  </div>
                  <span className="text-xs text-stone-300 shrink-0 mt-1">#{filtered.length - idx}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
