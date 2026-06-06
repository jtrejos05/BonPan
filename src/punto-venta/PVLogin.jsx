import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Eye, EyeOff, Store } from 'lucide-react'

export default function PVLogin() {
  const navigate = useNavigate()
  const [locales,  setLocales]  = useState([])
  const [pvId,     setPvId]     = useState('')
  const [pin,      setPin]      = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPin,  setShowPin]  = useState(false)

  useEffect(() => {
    // Verificar si ya hay sesión activa
    const token = localStorage.getItem('pv_token')
    if (token) { navigate('/punto-venta/dashboard'); return }
    // Cargar locales disponibles
    api.puntosVenta.getAll()
      .then(data => setLocales(data.filter(l => l.activo)))
      .catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pvId) return setError('Selecciona un local')
    setLoading(true); setError('')
    try {
      const res = await api.puntosVenta.login(Number(pvId), pin)
      localStorage.setItem('pv_token',    res.token)
      localStorage.setItem('pv_data',     JSON.stringify(res.puntoVenta))
      navigate('/punto-venta/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-800
                    flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}/>

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-left">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Bon Pan" className="h-16 w-16 object-contain mx-auto mb-4"/>
            <h1 className="text-2xl font-black text-red-900" style={{fontFamily:'Playfair Display,serif'}}>
              Panel de Ventas
            </h1>
            <p className="text-stone-400 text-sm mt-1 font-medium">Acceso para empleados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de local */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                <Store size={12} className="inline mr-1"/> Selecciona tu local
              </label>
              <select value={pvId} onChange={e=>setPvId(e.target.value)} required
                className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                           font-medium focus:outline-none focus:border-red-400 bg-white text-sm">
                <option value="">— Elige un local —</option>
                {locales.map(l => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-2">
                PIN de acceso
              </label>
              <div className="relative border-2 border-stone-100 rounded-xl focus-within:border-red-400 transition-colors">
                <input type={showPin?'text':'password'}
                  value={pin} onChange={e=>setPin(e.target.value)} required
                  placeholder="••••"
                  className="w-full bg-transparent px-4 py-3 text-stone-700 font-mono font-bold
                             text-xl tracking-widest focus:outline-none pr-12"/>
                <button type="button" onClick={()=>setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPin ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-semibold">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-red-950 text-white font-black py-4 rounded-2xl
                         hover:bg-red-900 transition-colors disabled:opacity-50 text-sm tracking-widest uppercase">
              {loading ? '⏳ Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-6">
            <a href="/" className="hover:text-red-700 transition-colors font-medium">← Ir a la tienda</a>
          </p>
        </div>
      </div>
    </div>
  )
}
