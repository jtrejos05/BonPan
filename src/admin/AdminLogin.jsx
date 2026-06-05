import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const { adminLogin, adminAuth } = useApp()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  if (adminAuth) {
    navigate('/admin/dashboard')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const ok = await adminLogin(password)
      if (ok) {
        navigate('/admin/dashboard')
      } else {
        setError('Contraseña incorrecta. Intenta de nuevo.')
      }
    } catch {
      setError('No se pudo conectar al servidor. ¿Está corriendo el backend?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-left">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Bon Pan" className="h-20 w-20 mx-auto rounded-2xl object-contain mb-4 shadow-md" />
          <h1 className="text-2xl font-black text-red-900" style={{fontFamily:'Montserrat,sans-serif'}}>Panel Administrativo</h1>
          <p className="text-stone-500 text-sm mt-1">Ingresa tu contraseña para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••••"
                className={`w-full border rounded-xl pl-10 pr-10 py-3 text-stone-700 focus:outline-none focus:border-red-400 transition-colors
                  ${error ? 'border-red-400 bg-red-50' : 'border-stone-200'}`}
                required
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-red-700 text-white font-bold py-3 rounded-full hover:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          ¿Eres cliente? <a href="/" className="text-red-600 font-semibold hover:underline">Ir a la tienda →</a>
        </p>
      </div>
    </div>
  )
}
