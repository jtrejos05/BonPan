// En desarrollo apunta a localhost, en producción a Railway — v2
const BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://bonpan-production.up.railway.app/api')

function getToken() {
  return localStorage.getItem('bonpan_token')
}

// Token del panel admin y del punto de venta (empleados)
const adminAuth = () => {
  const t = localStorage.getItem('bonpan_admin_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}
const pvAuth = () => {
  const t = localStorage.getItem('pv_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}
// Para rutas que acepta admin o empleado: usa el token que exista
const staffAuth = () => {
  const admin = adminAuth()
  return admin.Authorization ? admin : pvAuth()
}

async function request(path, { headers = {}, ...options } = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Error de red' }))
    const error = new Error(data.error || 'Error desconocido')
    error.status = res.status
    error.data   = data
    throw error
  }
  return res.json()
}

// ── Productos ─────────────────────────────────────────────────
export const api = {
  productos: {
    getAll:     ()          => request('/productos'),
    create:     (data)      => request('/productos',        { method: 'POST',   body: JSON.stringify(data), headers: adminAuth() }),
    update:     (id, data)  => request(`/productos/${id}`,  { method: 'PUT',    body: JSON.stringify(data), headers: adminAuth() }),
    delete:     (id)        => request(`/productos/${id}`,  { method: 'DELETE', headers: adminAuth() }),
  },

  pedidos: {
    getAll:    ()               => request('/pedidos', { headers: adminAuth() }),
    create:    (data)           => request('/pedidos',              { method: 'POST', body: JSON.stringify(data) }),
    setStatus: (id, status)     => request(`/pedidos/${id}/estado`, { method: 'PUT',  body: JSON.stringify({ status }), headers: staffAuth() }),
  },

  clientes: {
    getAll:     ()    => request('/clientes',               { headers: adminAuth() }),
    getPedidos: (id)  => request(`/clientes/${id}/pedidos`, { headers: adminAuth() }),
  },

  actividad: {
    getAll: (limit = 100, type) =>
      request(`/actividad?limit=${limit}${type ? `&type=${type}` : ''}`, { headers: adminAuth() }),
    log: (type, description, data) =>
      request('/actividad', { method: 'POST', body: JSON.stringify({ type, description, data }) }),
  },

  auth: {
    login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },

  puntosVenta: {
    getAll:    ()          => request('/puntos-venta'),
    create:    (data)      => request('/puntos-venta',          { method: 'POST',   body: JSON.stringify(data), headers: adminAuth() }),
    update:    (id, data)  => request(`/puntos-venta/${id}`,    { method: 'PUT',    body: JSON.stringify(data), headers: adminAuth() }),
    remove:    (id)        => request(`/puntos-venta/${id}`,    { method: 'DELETE', headers: adminAuth() }),
    setDomicilios: (id)    => request(`/puntos-venta/${id}/domicilios`, { method: 'PATCH', headers: adminAuth() }),
    login:     (id, pin, deviceToken, deviceName) =>
      request('/puntos-venta/login', { method: 'POST', body: JSON.stringify({ id, pin, deviceToken, deviceName }) }),
    getPedidos:(id)        => request(`/puntos-venta/${id}/pedidos`, { headers: pvAuth() }),
    // Seguridad (admin)
    dispositivos: {
      getAll:  ()   => request('/puntos-venta/dispositivos',                { headers: adminAuth() }),
      aprobar: (id) => request(`/puntos-venta/dispositivos/${id}/aprobar`,  { method: 'PATCH',  headers: adminAuth() }),
      remove:  (id) => request(`/puntos-venta/dispositivos/${id}`,          { method: 'DELETE', headers: adminAuth() }),
    },
    accesos: (limit = 100) => request(`/puntos-venta/accesos?limit=${limit}`, { headers: adminAuth() }),
  },

  zonas: {
    getActivas: ()        => request('/zonas'),
    getAll:     ()        => request('/zonas/admin',        { headers: adminAuth() }),
    create:     (data)    => request('/zonas',              { method: 'POST',   body: JSON.stringify(data), headers: adminAuth() }),
    update:     (id, d)   => request(`/zonas/${id}`,        { method: 'PUT',    body: JSON.stringify(d),    headers: adminAuth() }),
    toggle:     (id)      => request(`/zonas/${id}/toggle`, { method: 'PATCH',  headers: adminAuth() }),
    remove:     (id)      => request(`/zonas/${id}`,        { method: 'DELETE', headers: adminAuth() }),
  },

  promociones: {
    getAll:       ()       => request('/promociones/admin',        { headers: adminAuth() }),
    getActivas:   ()       => request('/promociones'),
    getByCodigo:  (codigo) => request(`/promociones/codigo/${codigo}`),
    create:       (data)   => request('/promociones',              { method: 'POST',   body: JSON.stringify(data), headers: adminAuth() }),
    update:       (id, d)  => request(`/promociones/${id}`,        { method: 'PUT',    body: JSON.stringify(d),    headers: adminAuth() }),
    toggle:       (id)     => request(`/promociones/${id}/toggle`, { method: 'PATCH',  headers: adminAuth() }),
    remove:       (id)     => request(`/promociones/${id}`,        { method: 'DELETE', headers: adminAuth() }),
    usar:         (id)     => request(`/promociones/${id}/usar`,   { method: 'POST' }),
  },

  upload: {
    imagen: async (file) => {
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await fetch(`${BASE}/upload/imagen`, {
        method: 'POST',
        headers: adminAuth(),
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error al subir imagen' }))
        throw new Error(err.error)
      }
      return res.json()
    },
  },

  pagos: {
    firma:     (pedidoId, amountInCents) => request('/pagos/firma', { method: 'POST', body: JSON.stringify({ pedidoId, amountInCents }) }),
    verificar: (transactionId)           => request(`/pagos/verificar/${transactionId}`),
  },

  usuarios: {
    register:    (data)       => request('/usuarios/register', { method: 'POST', body: JSON.stringify(data) }),
    login:       (data)       => request('/usuarios/login',    { method: 'POST', body: JSON.stringify(data) }),
    googleLogin: (credential) => request('/usuarios/google',   { method: 'POST', body: JSON.stringify({ credential }) }),
    me:          ()           => request('/usuarios/me'),
    canjear:     (puntos)    => request('/usuarios/me/canjear', { method: 'POST', body: JSON.stringify({ puntos }) }),
  },
}
