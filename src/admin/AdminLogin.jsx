import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function AdminLogin() {
  const { adminLogin, adminAuth } = useApp()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)

  if (adminAuth) { navigate('/admin/dashboard'); return null }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const ok = await adminLogin(password)
      if (ok) navigate('/admin/dashboard')
      else setError('Contraseña incorrecta. Intenta de nuevo.')
    } catch {
      setError('No se pudo conectar al servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{backgroundImage:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px'}} />

      {/* Círculos decorativos */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-red-700 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500 rounded-full opacity-15 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-left">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-red-200 rounded-2xl blur-lg opacity-50" />
              <img src="/logo.png" alt="Bon Pan"
                className="relative h-20 w-20 mx-auto rounded-2xl object-contain shadow-lg mb-4" />
            </div>
            <h1 className="text-2xl font-black text-red-900 mt-4"
                style={{fontFamily:'Elms Sans, sans-serif'}}>Panel Administrativo</h1>
            <p className="text-stone-400 text-sm mt-1 font-medium">Acceso exclusivo para el equipo Bon Pan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••••"
                  className={`w-full border-2 rounded-2xl pl-11 pr-12 py-3.5 text-stone-700 font-medium
                    focus:outline-none transition-colors
                    ${error ? 'border-red-400 bg-red-50' : 'border-stone-100 focus:border-red-300'}`}
                  required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <p className="text-red-600 text-xs font-semibold">{error}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-red-700 text-white font-black py-4 rounded-2xl
                         hover:bg-red-800 transition-all duration-200 shadow-lg hover:shadow-xl
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><span className="animate-spin">⏳</span> Verificando...</>
              ) : (
                <>Ingresar al Panel <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-6 font-medium">
            ¿Eres cliente?{' '}
            <a href="/" className="text-red-600 font-bold hover:text-red-800 transition-colors">
              Ir a la tienda →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
