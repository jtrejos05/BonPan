import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Register() {
  const { register, loginGoogle } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [show,    setShow]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm)
      return setError('Las contraseñas no coinciden')
    if (form.password.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
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
      navigate('/')
    } catch {
      setError('No se pudo registrar con Google.')
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
            Crear Cuenta
          </h1>
          <p className="text-stone-400 font-medium mt-2 text-sm">Únete a la familia Bon Pan</p>
        </div>

        <div className="bg-white border border-stone-200 p-8">
          {/* Google */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError('Error al registrarse con Google')}
              text="signup_with"
              shape="rectangular"
              width="100%"
              locale="es"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-xs tracking-widest uppercase font-semibold">o con correo</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: 'name',     label: 'Nombre completo',     type: 'text',     placeholder: 'Tu nombre' },
              { key: 'email',    label: 'Correo electrónico',  type: 'email',    placeholder: 'tu@correo.com' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                  {f.label}
                </label>
                <input type={f.type} required
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                             font-medium text-sm focus:outline-none focus:border-red-800 transition-colors
                             placeholder:text-stone-300" />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                Contraseña
              </label>
              <div className="relative border-b-2 border-stone-200 focus-within:border-red-800 transition-colors">
                <input type={show ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-transparent py-2.5 pr-10 text-stone-700 font-medium text-sm
                             focus:outline-none placeholder:text-stone-300" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                Confirmar contraseña
              </label>
              <input type="password" required
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repite tu contraseña"
                className="w-full border-b-2 border-stone-200 bg-transparent py-2.5 text-stone-700
                           font-medium text-sm focus:outline-none focus:border-red-800 transition-colors
                           placeholder:text-stone-300" />
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
              {loading ? '⏳ Creando cuenta...' : <> Crear Cuenta <ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6 font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login"
              className="text-red-800 font-bold hover:text-red-950 transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
