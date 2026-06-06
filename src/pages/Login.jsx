import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const { loginEmail, loginGoogle } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [show,    setShow]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginEmail(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle(credentialResponse) {
    setError('')
    try {
      await loginGoogle(credentialResponse.credential)
      navigate(from, { replace: true })
    } catch (err) {
      setError('No se pudo iniciar sesión con Google.')
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <img src="/logo.png" alt="Bon Pan" className="h-16 w-16 object-contain mx-auto mb-4" />
          </Link>
          <h1 className="text-4xl text-red-950" style={{fontFamily:'Playfair Display, serif'}}>
            Iniciar Sesión
          </h1>
          <p className="text-stone-400 font-medium mt-2 text-sm">Bienvenido de vuelta a Bon Pan</p>
        </div>

        <div className="bg-white border border-stone-200 p-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                Correo electrónico
              </label>
              <input type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="tu@correo.com"
                className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                           font-medium text-sm focus:outline-none focus:border-red-800 transition-colors
                           placeholder:text-stone-300" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                Contraseña
              </label>
              <div className="relative border-b-2 border-stone-200 focus-within:border-red-800 transition-colors">
                <input type={show ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-2.5 pr-10 text-stone-700 font-medium text-sm
                             focus:outline-none placeholder:text-stone-300" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase
                         py-4 hover:bg-red-900 transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2 mt-2">
              {loading ? '⏳ Ingresando...' : <> Iniciar Sesión <ArrowRight size={14} /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-xs tracking-widest uppercase font-semibold">o continúa con</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Google */}
          <div>
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError('Error al iniciar sesión con Google')}
              text="signin_with"
              shape="rectangular"
              width="100%"
              locale="es"
            />
          </div>

          <p className="text-center text-sm text-stone-400 mt-6 font-medium">
            ¿No tienes cuenta?{' '}
            <Link to="/register" state={{ from }}
              className="text-red-800 font-bold hover:text-red-950 transition-colors">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
