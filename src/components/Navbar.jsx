import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { cartCount } = useApp()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/',         label: 'Inicio'   },
    { to: '/menu',     label: 'Menú'     },
    { to: '/pedido',   label: 'Pedido'   },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-18 py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Bon Pan"
            className="h-12 w-12 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform duration-200" />
          <div className="text-left">
            <p className="font-black text-lg text-red-900 leading-tight tracking-tight"
               style={{fontFamily:'Montserrat,sans-serif'}}>Bon Pan</p>
            <p className="text-xs text-red-400 font-semibold tracking-widest uppercase leading-tight">Panadería</p>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${pathname === l.to
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-red-700 hover:bg-red-50'}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Cart + hamburger */}
        <div className="flex items-center gap-3">
          <Link to="/pedido"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
            <ShoppingCart size={20} className="text-red-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
            onClick={() => setOpen(!open)}>
            {open ? <X size={20} className="text-stone-700" /> : <Menu size={20} className="text-stone-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-5 py-4 flex flex-col gap-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                ${pathname === l.to ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-red-50'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
