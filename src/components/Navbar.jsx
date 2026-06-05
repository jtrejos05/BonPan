import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { cartCount } = useApp()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/menu', label: 'Menú' },
    { to: '/pedido', label: 'Pedido' },
    { to: '/contacto', label: 'Contacto' },
  ]

  const active = 'text-amber-700 font-semibold border-b-2 border-amber-700'
  const inactive = 'text-stone-700 hover:text-amber-700 transition-colors'

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 rounded-lg object-contain" />
          <span className="font-black text-xl text-red-800 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>Bon Pan</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to} className={`pb-1 ${pathname === l.to ? active : inactive}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Link to="/pedido" className="relative">
            <ShoppingCart size={24} className="text-stone-700 hover:text-amber-700 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden text-stone-700" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-3 flex flex-col gap-3">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`py-1 ${pathname === l.to ? 'text-amber-700 font-semibold' : 'text-stone-700'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
