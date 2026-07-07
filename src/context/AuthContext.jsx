import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Cargar usuario desde token guardado
  useEffect(() => {
    const token = localStorage.getItem('bonpan_token')
    if (!token) { setLoadingAuth(false); return }
    api.usuarios.me()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('bonpan_token'))
      .finally(() => setLoadingAuth(false))
  }, [])

  function saveSession({ token, user }) {
    localStorage.setItem('bonpan_token', token)
    setUser(user)
  }

  async function register(name, email, password, phone) {
    const res = await api.usuarios.register({ name, email, password, phone })
    saveSession(res)
    return res.user
  }

  async function loginEmail(email, password) {
    const res = await api.usuarios.login({ email, password })
    saveSession(res)
    return res.user
  }

  async function loginGoogle(credential) {
    const res = await api.usuarios.googleLogin(credential)
    saveSession(res)
    return res.user
  }

  async function refreshUser() {
    try {
      const u = await api.usuarios.me()
      setUser(u)
    } catch {}
  }

  function logout() {
    localStorage.removeItem('bonpan_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loadingAuth, register, loginEmail, loginGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
