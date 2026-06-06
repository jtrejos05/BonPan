import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServerError from '../components/ServerError'
import { ArrowRight, Star, Clock, Truck } from 'lucide-react'

export default function Home() {
  const { addToCart, products, loading, error } = useApp()
  const featured = products.slice(0, 3)

  if (error) return <ServerError message={error} />

  return (
    <div className="text-left">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-800 min-h-[90vh] flex items-center">
        {/* Pattern de fondo */}
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}} />

        {/* Círculos decorativos */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-red-700 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500 rounded-full opacity-15 blur-3xl" />

        <div className="max-w-6xl mx-auto px-5 py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 text-red-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
                <Star size={14} className="fill-current text-yellow-400" />
                Panadería Artesanal desde 2010
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
                  style={{fontFamily:'Montserrat,sans-serif'}}>
                El sabor<br/>
                <span className="text-red-300">auténtico</span><br/>
                del hojaldre
              </h1>

              <p className="text-red-200 text-lg mb-10 leading-relaxed max-w-md">
                Croissants, pasteles de pollo y carne. Todo elaborado a mano con ingredientes frescos cada mañana.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/menu"
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-900 font-bold px-8 py-4 rounded-2xl hover:bg-red-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-sm">
                  Ver Menú Completo <ArrowRight size={18} />
                </Link>
                <Link to="/pedido"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-200 text-sm backdrop-blur-sm">
                  Hacer un Pedido
                </Link>
              </div>
            </div>

            {/* Logo grande */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-3xl blur-2xl opacity-30 scale-110" />
                <img src="/logo.png" alt="Bon Pan"
                  className="relative w-72 h-72 object-contain rounded-3xl shadow-2xl" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg">
            {[
              { value: '15+', label: 'Años de experiencia' },
              { value: '20+', label: 'Productos frescos' },
              { value: '100%', label: 'Artesanal' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-red-300 text-xs font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Star className="text-red-600" size={28} />, title: 'Ingredientes Premium', desc: 'Solo usamos ingredientes naturales y de primera calidad para cada producto.' },
              { icon: <Clock className="text-red-600" size={28} />, title: 'Frescos Cada Día', desc: 'Horneamos desde las 5am para que siempre encuentres producto fresco.' },
              { icon: <Truck className="text-red-600" size={28} />, title: 'Listo para Llevar', desc: 'Pedidos empacados con cuidado, listos en el menor tiempo posible.' },
            ].map(f => (
              <div key={f.title}
                className="group p-8 rounded-3xl bg-red-50 hover:bg-red-700 transition-all duration-300 cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm group-hover:bg-red-600 transition-colors">
                  <div className="group-hover:[&>svg]:text-white transition-colors">{f.icon}</div>
                </div>
                <h3 className="font-black text-red-900 group-hover:text-white text-lg mb-2 transition-colors"
                    style={{fontFamily:'Montserrat,sans-serif'}}>{f.title}</h3>
                <p className="text-stone-500 group-hover:text-red-200 text-sm leading-relaxed transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-red-600 font-bold text-sm tracking-widest uppercase mb-3">Lo mejor de hoy</p>
            <h2 className="text-4xl font-black text-red-950 mb-3"
                style={{fontFamily:'Montserrat,sans-serif'}}>Destacados del Día</h2>
            <p className="text-stone-500 max-w-md mx-auto">Los favoritos que no puedes dejar de probar</p>
          </div>

          {loading.products ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featured.map(p => (
                <div key={p.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 text-8xl
                                  group-hover:from-red-100 group-hover:to-orange-100 transition-colors">
                    {p.emoji}
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full uppercase tracking-wide">
                      {p.category}
                    </span>
                    <h3 className="font-black text-red-950 text-lg mt-3 mb-1"
                        style={{fontFamily:'Montserrat,sans-serif'}}>{p.name}</h3>
                    <p className="text-stone-400 text-sm mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Precio</p>
                        <p className="text-red-700 font-black text-xl">${p.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => addToCart(p)}
                        className="bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-800 transition-colors shadow-sm hover:shadow-md">
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/menu"
              className="inline-flex items-center gap-2 bg-red-700 text-white font-bold px-10 py-4 rounded-2xl hover:bg-red-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Ver Menú Completo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-20 bg-red-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}} />
        <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
          <h2 className="text-4xl font-black text-white mb-4"
              style={{fontFamily:'Montserrat,sans-serif'}}>¿Listo para ordenar?</h2>
          <p className="text-red-200 mb-8 text-lg">Haz tu pedido en línea y lo tenemos listo para ti</p>
          <Link to="/pedido"
            className="inline-flex items-center gap-2 bg-white text-red-900 font-black px-10 py-4 rounded-2xl hover:bg-red-50 transition-all duration-200 shadow-xl text-lg">
            Hacer Pedido Ahora <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-red-950 text-red-300 py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 rounded-lg object-contain" />
            <div className="text-left">
              <p className="font-black text-white text-sm" style={{fontFamily:'Montserrat,sans-serif'}}>Bon Pan</p>
              <p className="text-red-400 text-xs">Panadería Artesanal</p>
            </div>
          </div>
          <p className="text-xs text-red-500">© 2026 Bon Pan · Todos los derechos reservados</p>
          <div className="flex gap-4 text-xs">
            <Link to="/menu" className="hover:text-white transition-colors">Menú</Link>
            <Link to="/pedido" className="hover:text-white transition-colors">Pedidos</Link>
            <Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
