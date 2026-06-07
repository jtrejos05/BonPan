import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartCount } = useApp()
  const { user, logout } = useAuth()
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
      {/* Franja superior */}
      <div className="bg-stone-900 text-stone-300 text-center py-2 text-[11px] font-medium tracking-[0.2em] uppercase">
        Horneamos todos los días desde las 6am · Ibagué, Tolima
      </div>

      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16 sm:h-20">

            {/* Logo — izquierda */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center overflow-hidden shrink-0">
                <img src="/logo.png" alt="Bon Pan"
                  className="w-14 h-14 object-contain group-hover:opacity-80 transition-opacity duration-300"
                  style={{ transform: 'rotate(40deg)' }} />
              </div>
              <div className="leading-none">
                <p className="font-black text-stone-900 text-lg tracking-tight"
                   style={{fontFamily:'Playfair Display, serif'}}>Bon Pan</p>
                <p className="text-stone-400 text-[9px] font-semibold tracking-[0.2em] uppercase">Panadería · Ibagué</p>
              </div>
            </Link>

            {/* Links — centro/derecha desktop */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {links.slice(0, 2).map(l => (
                <Link key={l.to} to={l.to}
                  className={`text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-200
                    ${pathname === l.to ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}>
                  {l.label}
                </Link>
              ))}
              {links.slice(2).map(l => (
                <Link key={l.to} to={l.to}
                  className={`text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-200
                    ${pathname === l.to ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Acciones — derecha desktop */}
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <Link to="/pedido" className="relative">
                <ShoppingCart size={19} className="text-stone-500 hover:text-stone-900 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-stone-900 text-white text-sm font-black flex items-center justify-center">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>}
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 top-12 bg-white border border-stone-200 shadow-xl w-52 z-50 py-2">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="font-bold text-stone-800 text-sm truncate">{user.name}</p>
                        <p className="text-stone-400 text-xs truncate">{user.email}</p>
                      </div>
                      <button onClick={() => { logout(); setUserMenu(false) }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-stone-500
                                   hover:bg-stone-50 hover:text-stone-900 transition-colors font-medium">
                        <LogOut size={14} /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase
                             border border-stone-300 px-4 py-2 text-stone-600
                             hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200">
                  <User size={13} /> Ingresar
                </Link>
              )}
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-4">
              <Link to="/pedido" className="relative">
                <ShoppingCart size={20} className="text-stone-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setOpen(!open)} className="text-stone-700 p-1">
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-b border-stone-100 px-5 py-3">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`flex items-center py-3.5 text-xs font-bold tracking-[0.15em] uppercase border-b border-stone-100 last:border-0
                  ${pathname === l.to ? 'text-stone-900' : 'text-stone-400'}`}>
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 mt-3 text-xs font-bold tracking-widest uppercase
                           border border-stone-300 px-4 py-3 text-stone-600 w-full justify-center">
                <User size={13} /> Ingresar
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
