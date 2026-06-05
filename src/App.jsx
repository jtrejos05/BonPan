import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'

// Client layout & pages
import Navbar    from './components/Navbar'
import Home      from './pages/Home'
import Menu      from './pages/Menu'
import Order     from './pages/Order'
import Contact   from './pages/Contact'

// Admin module
import AdminLogin      from './admin/AdminLogin'
import AdminLayout     from './admin/AdminLayout'
import AdminDashboard  from './admin/AdminDashboard'
import AdminPedidos    from './admin/AdminPedidos'
import AdminProductos  from './admin/AdminProductos'
import AdminClientes   from './admin/AdminClientes'
import AdminActividad  from './admin/AdminActividad'

function ClientLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/menu"     element={<Menu />} />
        <Route path="/pedido"   element={<Order />} />
        <Route path="/contacto" element={<Contact />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin module — layout propio, sin Navbar de clientes */}
          <Route path="/admin/login"     element={<AdminLogin />} />
          <Route path="/admin"           element={<AdminLayout />}>
            <Route index                 element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"      element={<AdminDashboard />} />
            <Route path="pedidos"        element={<AdminPedidos />} />
            <Route path="productos"      element={<AdminProductos />} />
            <Route path="clientes"       element={<AdminClientes />} />
            <Route path="actividad"      element={<AdminActividad />} />
          </Route>

          {/* Client module */}
          <Route path="/*" element={<ClientLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
