// En desarrollo apunta a localhost, en producción a la API real
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
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
    login: (password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  },
}
