import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ── Estado ───────────────────────────────────────────────────
  const [products,    setProducts]    = useState([])
  const [orders,      setOrders]      = useState([])
  const [clients,     setClients]     = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [cart,        setCart]        = useState([])
  const [adminAuth,   setAdminAuth]   = useState(() => !!localStorage.getItem('bonpan_admin_token'))
  const [loading,     setLoading]     = useState({ products: true, orders: false, clients: false })
  const [error,       setError]       = useState(null)

  // ── Fetch inicial de productos ────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(l => ({ ...l, products: true }))
      const data = await api.productos.getAll()
      setProducts(data)
    } catch (e) {
      setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.')
      console.error(e)
    } finally {
      setLoading(l => ({ ...l, products: false }))
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(l => ({ ...l, orders: true }))
      const data = await api.pedidos.getAll()
      setOrders(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(l => ({ ...l, orders: false }))
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      setLoading(l => ({ ...l, clients: true }))
      const data = await api.clientes.getAll()
      setClients(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(l => ({ ...l, clients: false }))
    }
  }, [])

  const fetchActivity = useCallback(async () => {
    try {
      const data = await api.actividad.getAll(100)
      setActivityLog(data)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Cuando el admin inicia sesión, carga todo
  useEffect(() => {
    if (adminAuth) {
      fetchOrders()
      fetchClients()
      fetchActivity()
    }
  }, [adminAuth, fetchOrders, fetchClients, fetchActivity])

  // ── Cart (local, no persiste — es por sesión) ─────────────────
  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    // Log al backend
    api.actividad.log('carrito', `Producto agregado: ${product.name}`, { productId: product.id })
      .catch(() => {})
  }

  function removeFromCart(id) {
    const item = cart.find(i => i.id === id)
    setCart(prev => prev.filter(i => i.id !== id))
    if (item) api.actividad.log('carrito', `Producto eliminado del carrito: ${item.name}`).catch(() => {})
  }

  function updateQty(id, qty) {
    if (qty < 1) return removeFromCart(id)
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  // ── Pedidos ───────────────────────────────────────────────────
  async function placeOrder(customerInfo) {
    // Si el checkout calculó un total con descuentos, ese es el que se cobra
    const total = customerInfo.totalConDescuento ?? cart.reduce((s, i) => s + i.price * i.qty, 0)
    const orderData = { customer: customerInfo, items: cart, total }
    const newOrder = await api.pedidos.create(orderData)
    setOrders(prev => [{ ...newOrder, customer: customerInfo, items: cart, statusHistory: [{ status: 'Pendiente', timestamp: new Date().toLocaleString('es-CO') }] }, ...prev])
    setCart([])
    return newOrder
  }

  async function updateOrderStatus(id, status) {
    await api.pedidos.setStatus(id, status)
    const ts = new Date().toLocaleString('es-CO')
    setOrders(prev => prev.map(o =>
      o.id === id
        ? { ...o, status, statusHistory: [...(o.statusHistory || []), { status, timestamp: ts }] }
        : o
    ))
    // Refrescar actividad
    fetchActivity()
  }

  // ── Productos ─────────────────────────────────────────────────
  async function addProduct(product) {
    const created = await api.productos.create(product)
    setProducts(prev => [...prev, created])
    fetchActivity()
  }

  async function updateProduct(updated) {
    const saved = await api.productos.update(updated.id, updated)
    setProducts(prev => prev.map(p => p.id === saved.id ? saved : p))
    fetchActivity()
  }

  async function deleteProduct(id) {
    await api.productos.delete(id)
    setProducts(prev => prev.filter(p => p.id !== id))
    fetchActivity()
  }

  // ── Auth ──────────────────────────────────────────────────────
  async function adminLogin(username, password) {
    try {
      const res = await api.auth.login(username, password)
      if (res.ok && res.token) {
        localStorage.setItem('bonpan_admin_token', res.token)
        setAdminAuth(true)
        api.actividad.log('sistema', 'Inicio de sesión en panel admin').catch(() => {})
        return true
      }
      return false
    } catch {
      return false
    }
  }

  function adminLogout() {
    localStorage.removeItem('bonpan_admin_token')
    setAdminAuth(false)
    api.actividad.log('sistema', 'Cierre de sesión en panel admin').catch(() => {})
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <AppContext.Provider value={{
      // Cart
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, placeOrder,
      // Orders
      orders, updateOrderStatus, fetchOrders,
      // Products
      products, addProduct, updateProduct, deleteProduct,
      // Clients
      clients, fetchClients,
      // Activity
      activityLog, fetchActivity,
      // Auth
      adminAuth, adminLogin, adminLogout,
      // UI
      loading, error,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
