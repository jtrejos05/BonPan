import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider }  from './context/AppContext'
import { AuthProvider } from './context/AuthContext'

// Client pages
import Navbar    from './components/Navbar'
import Home      from './pages/Home'
import Menu      from './pages/Menu'
import Order     from './pages/Order'
import Contact   from './pages/Contact'
import Login     from './pages/Login'
import Register  from './pages/Register'

// Admin module
import AdminLogin       from './admin/AdminLogin'
import AdminLayout      from './admin/AdminLayout'
import AdminDashboard   from './admin/AdminDashboard'
import AdminPedidos     from './admin/AdminPedidos'
import AdminProductos   from './admin/AdminProductos'
import AdminPromociones from './admin/AdminPromociones'
import AdminPuntosVenta from './admin/AdminPuntosVenta'
import AdminClientes    from './admin/AdminClientes'
import AdminActividad   from './admin/AdminActividad'

// Punto de venta module
import PVLogin     from './punto-venta/PVLogin'
import PVDashboard from './punto-venta/PVDashboard'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

/* ─── Loading Screen ─────────────────────────── */
function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[9999] bg-stone-950 flex flex-col items-center justify-center gap-6">
      <motion.img
        src="/logo.png"
        alt="Bon Pan"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-32 h-32 object-contain"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-white font-black text-2xl tracking-widest"
        style={{ fontFamily: 'Elms Sans, sans-serif' }}>
        Bon Pan
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="text-stone-500 text-xs tracking-[0.4em] uppercase font-semibold">
        Panadería Artesanal
      </motion.p>
      {/* Barra de carga */}
      <motion.div className="w-32 h-0.5 bg-stone-800 rounded-full overflow-hidden mt-2">
        <motion.div
          className="h-full bg-amber-300 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  )
}

function ClientLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/menu"     element={<Menu />} />
        <Route path="/pedido"   element={<Order />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [loading, setLoading] = useState(() => {
    // Solo mostrar loading en la primera visita de la sesión
    if (sessionStorage.getItem('bp_loaded')) return false
    sessionStorage.setItem('bp_loaded', '1')
    return true
  })

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <AuthProvider>
          <AnimatePresence>
            {loading && <LoadingScreen key="loader" onDone={() => setLoading(false)} />}
          </AnimatePresence>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Admin module */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin"       element={<AdminLayout />}>
                <Route index                  element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard"       element={<AdminDashboard />} />
                <Route path="pedidos"         element={<AdminPedidos />} />
                <Route path="productos"       element={<AdminProductos />} />
                <Route path="promociones"     element={<AdminPromociones />} />
                <Route path="puntos-venta"    element={<AdminPuntosVenta />} />
                <Route path="clientes"        element={<AdminClientes />} />
                <Route path="actividad"       element={<AdminActividad />} />
              </Route>

              {/* Punto de venta module */}
              <Route path="/punto-venta"           element={<PVLogin />} />
              <Route path="/punto-venta/dashboard" element={<PVDashboard />} />

              {/* Client module */}
              <Route path="/*" element={<ClientLayout />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  )
}
