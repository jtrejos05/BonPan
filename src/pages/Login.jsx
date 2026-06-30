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
    } catch {
      setError('No se pudo iniciar sesión con Google.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Panel izquierdo — imagen decorativa (solo desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80"
          alt="Bon Pan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/40" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">Bon Pan</p>
          <p className="text-white text-3xl font-black leading-tight" style={{fontFamily:'Elms Sans, sans-serif'}}>
            "Pan hecho a mano, todos los días."
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 object-contain group-hover:opacity-70 transition-opacity" />
            <div>
              <p className="font-black text-stone-900 text-lg leading-none" style={{fontFamily:'Elms Sans, sans-serif'}}>Bon Pan</p>
              <p className="text-stone-400 text-[10px] tracking-widest uppercase">Panadería · Ibagué</p>
            </div>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2"
              style={{fontFamily:'Elms Sans, sans-serif'}}>
            Bienvenido.
          </h1>
          <p className="text-stone-400 text-sm mb-8">Ingresa a tu cuenta para continuar</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                Correo electrónico
              </label>
              <input type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="tu@correo.com"
                className="w-full border-b-2 border-stone-200 bg-transparent py-3 text-stone-800
                           font-medium text-sm focus:outline-none focus:border-stone-900 transition-colors
                           placeholder:text-stone-300" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                Contraseña
              </label>
              <div className="relative border-b-2 border-stone-200 focus-within:border-stone-900 transition-colors">
                <input type={show ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-transparent py-3 pr-10 text-stone-800 font-medium text-sm
                             focus:outline-none placeholder:text-stone-300" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="border-l-2 border-red-500 pl-3 py-1">
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-stone-900 text-white font-bold text-xs tracking-[0.2em] uppercase
                         py-4 hover:bg-stone-700 transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2 touch-manipulation">
              {loading ? 'Ingresando...' : <> Iniciar Sesión <ArrowRight size={14} /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-[10px] tracking-widest uppercase font-semibold">o continúa con</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Google */}
          <div className="flex justify-center mb-8">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError('Error al iniciar sesión con Google')}
              text="signin_with"
              shape="rectangular"
              width="100%"
              locale="es"
            />
          </div>

          <p className="text-center text-sm text-stone-400 font-medium">
            ¿No tienes cuenta?{' '}
            <Link to="/register" state={{ from }}
              className="text-stone-900 font-bold hover:underline transition-colors">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
