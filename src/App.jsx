import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SpeedInsights } from '@vercel/speed-insights/react'

/* ─── Botón flotante de WhatsApp ─────────────── */
function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(t)
  }, [])
  const url = 'https://wa.me/573053067179?text=Hola%20Bon%20Pan%2C%20quisiera%20hacer%20un%20pedido%20%F0%9F%A5%90'
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: '#25D366' }}
          title="Escríbenos por WhatsApp">
          {/* Ícono WhatsApp SVG */}
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {/* Pulso */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: '#25D366' }} />
        </motion.a>
      )}
    </AnimatePresence>
  )
}

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
      <WhatsAppButton />
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
          <SpeedInsights />
        </AuthProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  )
}
