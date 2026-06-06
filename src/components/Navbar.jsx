import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { cartCount } = useApp()
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { to: '/',         label: 'Inicio'   },
    { to: '/menu',     label: 'Menú'     },
    { to: '/pedido',   label: 'Pedido'   },
    { to: '/contacto', label: 'Contacto' },
  ]

  return (
    <>
      {/* Top bar — estilo Magnolia */}
      <div className="bg-red-900 text-red-100 text-center py-2 text-xs font-semibold tracking-widest uppercase">
        🥐 Horneamos todos los días desde las 6am · Pereira, Risaralda
      </div>

      <nav className={`sticky top-0 z-50 bg-[#faf7f2] transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        {/* Línea decorativa top */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-red-800 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
          {/* Logo centrado en desktop */}
          <div className="hidden md:flex items-center gap-8 flex-1">
            {links.slice(0, 2).map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-semibold tracking-widest uppercase transition-colors duration-200
                  ${pathname === l.to ? 'text-red-800 border-b-2 border-red-800 pb-0.5' : 'text-stone-500 hover:text-red-800'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Logo centrado */}
          <Link to="/" className="flex flex-col items-center gap-1 group mx-auto md:mx-0">
            <img src="/logo.png" alt="Bon Pan"
              className="h-14 w-14 object-contain group-hover:scale-105 transition-transform duration-300" />
            <div className="text-center leading-tight">
              <p className="font-black text-red-900 text-lg tracking-tight"
                 style={{fontFamily:'Playfair Display, serif'}}>Bon Pan</p>
              <p className="text-red-400 text-[10px] font-semibold tracking-[0.2em] uppercase">Panadería Artesanal</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
            {links.slice(2).map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-semibold tracking-widest uppercase transition-colors duration-200
                  ${pathname === l.to ? 'text-red-800 border-b-2 border-red-800 pb-0.5' : 'text-stone-500 hover:text-red-800'}`}>
                {l.label}
              </Link>
            ))}
            <Link to="/pedido" className="relative ml-2">
              <ShoppingCart size={20} className="text-stone-600 hover:text-red-800 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-800 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/pedido" className="relative">
              <ShoppingCart size={20} className="text-stone-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-800 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(!open)} className="text-stone-700">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Línea bottom decorativa */}
        <div className="h-px bg-stone-200" />

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-[#faf7f2] border-t border-stone-100 px-6 py-4 space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`block py-3 text-sm font-semibold tracking-widest uppercase border-b border-stone-100
                  ${pathname === l.to ? 'text-red-800' : 'text-stone-500'}`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
