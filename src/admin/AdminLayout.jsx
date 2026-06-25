import { useState } from 'react'
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard, Package, ClipboardList, Activity,
  LogOut, Users, Tag, Store, Menu, X, ChevronRight
} from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard',    label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
  { to: '/admin/pedidos',      label: 'Pedidos',         icon: <ClipboardList size={18} /> },
  { to: '/admin/productos',    label: 'Productos',       icon: <Package size={18} /> },
  { to: '/admin/promociones',  label: 'Promociones',     icon: <Tag size={18} /> },
  { to: '/admin/puntos-venta', label: 'Puntos de Venta', icon: <Store size={18} /> },
  { to: '/admin/clientes',     label: 'Clientes',        icon: <Users size={18} /> },
  { to: '/admin/actividad',    label: 'Actividad',       icon: <Activity size={18} /> },
]

function SidebarContent({ pathname, pending, onClose, adminLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-red-900 flex items-center justify-between">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Bon Pan"
            className="h-11 w-11 rounded-xl object-contain bg-white/10 p-0.5 group-hover:scale-105 transition-transform" />
          <div>
            <p className="font-black text-base leading-tight text-white" style={{fontFamily:'Elms Sans, sans-serif'}}>Bon Pan</p>
            <p className="text-red-400 text-xs font-semibold tracking-wide">Panel Admin</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {/* Cerrar sesión — visible en desktop sidebar */}
          {!onClose && (
            <button onClick={adminLogout}
              className="text-red-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-red-900"
              title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          )}
          {/* Cerrar drawer — solo en móvil */}
          {onClose && (
            <button onClick={onClose} className="text-red-300 hover:text-white transition-colors p-1">
              <X size={22} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(l => {
          const isActive = pathname === l.to
          return (
            <Link key={l.to} to={l.to} onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200
                ${isActive ? 'bg-white text-red-900 shadow-lg' : 'text-red-200 hover:bg-red-900 hover:text-white'}`}>
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

      <div className="p-4 border-t border-red-900 space-y-2">
        <Link to="/" onClick={onClose}
          className="flex items-center gap-2 text-red-400 hover:text-white text-xs font-semibold transition-colors px-2">
          ← Ver sitio de clientes
        </Link>
        <button onClick={adminLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-200 text-sm font-bold transition-colors w-full px-2 py-2 rounded-xl hover:bg-red-900">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { adminAuth, adminLogout, orders } = useApp()
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!adminAuth) return <Navigate to="/admin/login" replace />

  const pending   = orders.filter(o => o.status === 'Pendiente').length
  const closeMenu = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-gray-50" style={{textAlign:'left'}}>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-red-950 text-white flex-col shrink-0 shadow-2xl">
        <SidebarContent pathname={pathname} pending={pending} onClose={null} adminLogout={adminLogout} />
      </aside>

      {/* Overlay + drawer móvil */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMenu} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-red-950 text-white flex flex-col shadow-2xl lg:hidden">
            <SidebarContent pathname={pathname} pending={pending} onClose={closeMenu} adminLogout={adminLogout} />
          </aside>
        </>
      )}

      {/* Área de contenido */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar móvil */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-red-950 text-white shadow-md shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-red-200 hover:text-white transition-colors p-1">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bon Pan" className="h-8 w-8 rounded-lg object-contain bg-white/10 p-0.5" />
            <span className="font-black text-sm" style={{fontFamily:'Elms Sans, sans-serif'}}>Panel Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <Link to="/admin/pedidos" onClick={closeMenu}
                className="bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {pending}
              </Link>
            )}
            <button onClick={adminLogout}
              className="text-red-200 hover:text-white transition-colors p-1"
              title="Cerrar sesión">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
