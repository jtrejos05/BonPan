import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LayoutDashboard, Package, ClipboardList, Activity, LogOut, Users, ChevronRight, Tag, Store } from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard',    label: 'Dashboard',      icon: <LayoutDashboard size={18} /> },
  { to: '/admin/pedidos',      label: 'Pedidos',        icon: <ClipboardList size={18} /> },
  { to: '/admin/productos',    label: 'Productos',      icon: <Package size={18} /> },
  { to: '/admin/promociones',  label: 'Promociones',    icon: <Tag size={18} /> },
  { to: '/admin/puntos-venta', label: 'Puntos de Venta',icon: <Store size={18} /> },
  { to: '/admin/clientes',     label: 'Clientes',       icon: <Users size={18} /> },
  { to: '/admin/actividad',    label: 'Actividad',      icon: <Activity size={18} /> },
]

export default function AdminLayout() {
  const { adminAuth, adminLogout, orders } = useApp()
  const { pathname } = useLocation()

  if (!adminAuth) return <Navigate to="/admin/login" replace />

  const pending = orders.filter(o => o.status === 'Pendiente').length

  return (
    <div className="flex min-h-screen bg-gray-50" style={{textAlign:'left'}}>
      {/* Sidebar */}
      <aside className="w-64 bg-red-950 text-white flex flex-col shrink-0 shadow-2xl">
        {/* Logo */}
        <div className="p-5 border-b border-red-900">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Bon Pan"
              className="h-11 w-11 rounded-xl object-contain bg-white/10 p-0.5
                         group-hover:scale-105 transition-transform" />
            <div>
              <p className="font-black text-base leading-tight"
                 style={{fontFamily:'Montserrat,sans-serif'}}>Bon Pan</p>
              <p className="text-red-400 text-xs font-semibold tracking-wide">Panel Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(l => {
            const isActive = pathname === l.to
            return (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200
                  ${isActive
                    ? 'bg-white text-red-900 shadow-lg'
                    : 'text-red-200 hover:bg-red-900 hover:text-white'}`}>
                <span className={isActive ? 'text-red-700' : ''}>{l.icon}</span>
                {l.label}
                {l.label === 'Pedidos' && pending > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {pending}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="ml-auto text-red-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-red-900 space-y-3">
          <Link to="/"
            className="flex items-center gap-2 text-red-400 hover:text-white text-xs font-semibold transition-colors px-2">
            ← Ver sitio de clientes
          </Link>
          <button onClick={adminLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-200 text-sm font-bold
                       transition-colors w-full px-2 py-2 rounded-xl hover:bg-red-900">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
