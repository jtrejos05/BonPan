import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LayoutDashboard, Package, ClipboardList, Activity, LogOut, Users } from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { to: '/admin/pedidos',   label: 'Pedidos',     icon: <ClipboardList size={18} /> },
  { to: '/admin/productos', label: 'Productos',   icon: <Package size={18} /> },
  { to: '/admin/clientes',  label: 'Clientes',    icon: <Users size={18} /> },
  { to: '/admin/actividad', label: 'Actividad',   icon: <Activity size={18} /> },
]

export default function AdminLayout() {
  const { adminAuth, adminLogout } = useApp()
  const { pathname } = useLocation()

  if (!adminAuth) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen bg-gray-50" style={{textAlign:'left'}}>
      {/* Sidebar */}
      <aside className="w-64 bg-red-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-red-800">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 rounded-lg object-contain bg-white p-0.5" />
            <div>
              <p className="font-black text-base leading-tight" style={{fontFamily:'Montserrat,sans-serif'}}>Bon Pan</p>
              <p className="text-red-300 text-xs font-medium">Panel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${pathname === l.to
                  ? 'bg-white text-red-900'
                  : 'text-red-100 hover:bg-red-800'}`}>
              {l.icon}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-red-800">
          <Link to="/" className="flex items-center gap-2 text-red-300 hover:text-white text-xs font-medium mb-3 transition-colors">
            ← Ver sitio de clientes
          </Link>
          <button onClick={adminLogout}
            className="flex items-center gap-2 text-red-300 hover:text-white text-sm font-semibold transition-colors w-full">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
