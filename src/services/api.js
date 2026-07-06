// En desarrollo apunta a localhost, en producción a Railway — v2
const BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://bonpan-production.up.railway.app/api')

function getToken() {
  return localStorage.getItem('bonpan_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de red' }))
    throw new Error(err.error || 'Error desconocido')
  }
  return res.json()
}

// ── Productos ─────────────────────────────────────────────────
export const api = {
  productos: {
    getAll:     ()          => request('/productos'),
    create:     (data)      => request('/productos',        { method: 'POST',   body: JSON.stringify(data) }),
    update:     (id, data)  => request(`/productos/${id}`,  { method: 'PUT',    body: JSON.stringify(data) }),
    delete:     (id)        => request(`/productos/${id}`,  { method: 'DELETE' }),
  },

  pedidos: {
    getAll:    ()               => request('/pedidos'),
    create:    (data)           => request('/pedidos',              { method: 'POST', body: JSON.stringify(data) }),
    setStatus: (id, status)     => request(`/pedidos/${id}/estado`, { method: 'PUT',  body: JSON.stringify({ status }) }),
  },

  clientes: {
    getAll:     ()    => request('/clientes'),
    getPedidos: (id)  => request(`/clientes/${id}/pedidos`),
  },

  actividad: {
    getAll: (limit = 100, type) =>
      request(`/actividad?limit=${limit}${type ? `&type=${type}` : ''}`),
    log: (type, description, data) =>
      request('/actividad', { method: 'POST', body: JSON.stringify({ type, description, data }) }),
  },

  auth: {
    login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  },

  puntosVenta: {
    getAll:    ()          => request('/puntos-venta'),
    create:    (data)      => request('/puntos-venta',          { method: 'POST',   body: JSON.stringify(data) }),
    update:    (id, data)  => request(`/puntos-venta/${id}`,    { method: 'PUT',    body: JSON.stringify(data) }),
    remove:    (id)        => request(`/puntos-venta/${id}`,    { method: 'DELETE' }),
    login:     (id, pin)   => request('/puntos-venta/login',    { method: 'POST',   body: JSON.stringify({ id, pin }) }),
    getPedidos:(id)        => request(`/puntos-venta/${id}/pedidos`),
  },

  promociones: {
    getAll:       ()       => request('/promociones/admin'),
    getActivas:   ()       => request('/promociones'),
    getByCodigo:  (codigo) => request(`/promociones/codigo/${codigo}`),
    create:       (data)   => request('/promociones',           { method: 'POST',  body: JSON.stringify(data) }),
    update:       (id, d)  => request(`/promociones/${id}`,     { method: 'PUT',   body: JSON.stringify(d) }),
    toggle:       (id)     => request(`/promociones/${id}/toggle`, { method: 'PATCH' }),
    remove:       (id)     => request(`/promociones/${id}`,     { method: 'DELETE' }),
    usar:         (id)     => request(`/promociones/${id}/usar`, { method: 'POST' }),
  },

  upload: {
    imagen: async (file) => {
      const formData = new FormData()
      formData.append('imagen', file)
      const token = getToken()
      const res = await fetch(`${BASE}/upload/imagen`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
