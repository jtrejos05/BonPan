import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'

// Client layout & pages
import Navbar    from './components/Navbar'
import Home      from './pages/Home'
import Menu      from './pages/Menu'
import Order     from './pages/Order'
import Contact   from './pages/Contact'
import Login     from './pages/Login'
import Register  from './pages/Register'

// Admin module
import AdminLogin      from './admin/AdminLogin'
import AdminLayout     from './admin/AdminLayout'
import AdminDashboard  from './admin/AdminDashboard'
import AdminPedidos    from './admin/AdminPedidos'
import AdminProductos  from './admin/AdminProductos'
import AdminPromociones from './admin/AdminPromociones'
import AdminClientes   from './admin/AdminClientes'
import AdminActividad  from './admin/AdminActividad'

// Google Client ID — configura el tuyo en .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || ''

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
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin module */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin"       element={<AdminLayout />}>
                <Route index             element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard"  element={<AdminDashboard />} />
                <Route path="pedidos"    element={<AdminPedidos />} />
                <Route path="productos"   element={<AdminProductos />} />
                <Route path="promociones" element={<AdminPromociones />} />
                <Route path="clientes"   element={<AdminClientes />} />
                <Route path="actividad"  element={<AdminActividad />} />
              </Route>

              {/* Client module */}
              <Route path="/*" element={<ClientLayout />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  )
}
