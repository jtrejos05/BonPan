// En desarrollo apunta a localhost, en producción a Railway — v2
const BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://bonpan-production.up.railway.app/api')

// Tres sesiones distintas conviven en el navegador: cliente, admin y punto de venta.
// Cada petición declara con cuál se autentica para no mezclarlas.
const TOKEN_KEYS = {
  user:  'bonpan_token',
  admin: 'bonpan_admin_token',
  pv:    'pv_token',
}

function getToken(authAs = 'user') {
  if (authAs === 'public') return null
  // 'staff': el panel admin y el punto de venta comparten endpoints
  if (authAs === 'staff') {
    return localStorage.getItem(TOKEN_KEYS.admin) || localStorage.getItem(TOKEN_KEYS.pv)
  }
  return localStorage.getItem(TOKEN_KEYS[authAs] || TOKEN_KEYS.user)
}

// Al expirar el token de admin, avisamos para que el panel cierre la sesión
// en vez de quedarse abierto con todas las peticiones fallando.
function expirarSesionAdmin() {
  localStorage.removeItem(TOKEN_KEYS.admin)
  window.dispatchEvent(new Event('bonpan:sesion-expirada'))
}

async function request(path, { authAs = 'user', ...options } = {}) {
  const token = getToken(authAs)
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (res.status === 401 && token && token === localStorage.getItem(TOKEN_KEYS.admin)) {
    expirarSesionAdmin()
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de red' }))
    throw new Error(err.error || 'Error desconocido')
  }
  return res.json()
}

// ── Productos ─────────────────────────────────────────────────
export const api = {
  productos: {
    getAll:     ()          => request('/productos',        { authAs: 'public' }),
    create:     (data)      => request('/productos',        { method: 'POST',   authAs: 'admin', body: JSON.stringify(data) }),
    update:     (id, data)  => request(`/productos/${id}`,  { method: 'PUT',    authAs: 'admin', body: JSON.stringify(data) }),
    delete:     (id)        => request(`/productos/${id}`,  { method: 'DELETE', authAs: 'admin' }),
  },

  pedidos: {
    getAll:    ()               => request('/pedidos',              { authAs: 'staff' }),
    create:    (data)           => request('/pedidos',              { method: 'POST', authAs: 'public', body: JSON.stringify(data) }),
    setStatus: (id, status)     => request(`/pedidos/${id}/estado`, { method: 'PUT',  authAs: 'staff',  body: JSON.stringify({ status }) }),
  },

  clientes: {
    getAll:     ()    => request('/clientes',              { authAs: 'staff' }),
    getPedidos: (id)  => request(`/clientes/${id}/pedidos`, { authAs: 'staff' }),
  },

  actividad: {
    getAll: (limit = 100, type) =>
      request(`/actividad?limit=${limit}${type ? `&type=${type}` : ''}`, { authAs: 'staff' }),
    log: (type, description, data) =>
      request('/actividad', { method: 'POST', authAs: 'staff', body: JSON.stringify({ type, description, data }) }),
  },

  auth: {
    login: (username, password) =>
      request('/auth/login', { method: 'POST', authAs: 'public', body: JSON.stringify({ username, password }) }),
  },

  puntosVenta: {
    getAll:    ()          => request('/puntos-venta',          { authAs: 'public' }),
    create:    (data)      => request('/puntos-venta',          { method: 'POST',   authAs: 'admin', body: JSON.stringify(data) }),
    update:    (id, data)  => request(`/puntos-venta/${id}`,    { method: 'PUT',    authAs: 'admin', body: JSON.stringify(data) }),
    remove:    (id)        => request(`/puntos-venta/${id}`,    { method: 'DELETE', authAs: 'admin' }),
    login:     (id, pin)   => request('/puntos-venta/login',    { method: 'POST',   authAs: 'public', body: JSON.stringify({ id, pin }) }),
    getPedidos:(id)        => request(`/puntos-venta/${id}/pedidos`, { authAs: 'staff' }),
  },

  promociones: {
    getAll:       ()       => request('/promociones/admin',        { authAs: 'admin' }),
    getActivas:   ()       => request('/promociones',              { authAs: 'public' }),
    getByCodigo:  (codigo) => request(`/promociones/codigo/${codigo}`, { authAs: 'public' }),
    create:       (data)   => request('/promociones',              { method: 'POST',  authAs: 'admin', body: JSON.stringify(data) }),
    update:       (id, d)  => request(`/promociones/${id}`,        { method: 'PUT',   authAs: 'admin', body: JSON.stringify(d) }),
    toggle:       (id)     => request(`/promociones/${id}/toggle`, { method: 'PATCH', authAs: 'admin' }),
    remove:       (id)     => request(`/promociones/${id}`,        { method: 'DELETE', authAs: 'admin' }),
    usar:         (id)     => request(`/promociones/${id}/usar`,   { method: 'POST',  authAs: 'public' }),
  },

  upload: {
    imagen: async (file) => {
      const formData = new FormData()
      formData.append('imagen', file)
      const token = getToken('admin')
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

  usuarios: {
    register:    (data)       => request('/usuarios/register', { method: 'POST', authAs: 'public', body: JSON.stringify(data) }),
    login:       (data)       => request('/usuarios/login',    { method: 'POST', authAs: 'public', body: JSON.stringify(data) }),
    googleLogin: (credential) => request('/usuarios/google',   { method: 'POST', authAs: 'public', body: JSON.stringify({ credential }) }),
    me:          ()           => request('/usuarios/me',       { authAs: 'user' }),
  },
}
