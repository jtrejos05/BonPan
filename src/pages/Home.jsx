import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServerError from '../components/ServerError'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../services/api'

function Divider({ text }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-stone-300" />
      <span className="text-stone-400 text-xs tracking-[0.3em] uppercase font-semibold">{text}</span>
      <div className="flex-1 h-px bg-stone-300" />
    </div>
  )
}

export default function Home() {
  const { addToCart, products, loading, error } = useApp()
  const featured = products.slice(0, 4)
  const [promociones, setPromociones] = useState([])

  useEffect(() => {
    api.promociones.getActivas()
      .then(data => setPromociones(data))
      .catch(() => {})
  }, [])

  if (error) return <ServerError message={error} />

  return (
    <div className="text-left bg-[#faf7f2]">

      {/* ── Hero ── */}
      <section className="relative bg-red-950 overflow-hidden">
        {/* Textura sutil */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />

        <div className="max-w-7xl mx-auto px-6 py-28 lg:py-36 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            {/* Eyebrow */}
            <p className="text-red-300 text-xs tracking-[0.4em] uppercase font-semibold mb-6">
              — Panadería Artesanal —
            </p>

            <h1 className="text-6xl lg:text-8xl text-white leading-none mb-6"
                style={{fontFamily:'Playfair Display, serif', fontWeight:700}}>
              Horneado<br/>
              <em className="text-red-300 not-italic">con amor,</em><br/>
              cada día.
            </h1>

            <p className="text-red-200/80 text-lg mb-10 leading-relaxed max-w-md font-light">
              Croissants hojaldrados, pasteles de pollo y carne. Elaborados a mano desde las primeras horas de la mañana en Pereira.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu"
                className="inline-flex items-center justify-center gap-2 bg-white text-red-950
                           font-bold text-sm tracking-widest uppercase px-10 py-4
                           hover:bg-red-50 transition-all duration-300 shadow-xl">
                Ver Menú <ArrowRight size={16} />
              </Link>
              <Link to="/pedido"
                className="inline-flex items-center justify-center gap-2 border border-white/40
                           text-white font-semibold text-sm tracking-widest uppercase px-10 py-4
                           hover:bg-white/10 transition-all duration-300">
                Ordenar Ahora
              </Link>
            </div>
          </div>

          {/* Logo ilustración */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute -inset-8 border border-white/10 rounded-full" />
              <div className="absolute -inset-16 border border-white/5 rounded-full" />
              <img src="/logo.png" alt="Bon Pan"
                className="w-72 h-72 object-contain drop-shadow-2xl" />
            </div>
            {/* Stats */}
            <div className="flex gap-10 mt-4">
              {[['15+','Años'],['20+','Productos'],['100%','Artesanal']].map(([v,l]) => (
                <div key={l} className="text-center">
                  <p className="text-3xl font-black text-white" style={{fontFamily:'Playfair Display,serif'}}>{v}</p>
                  <p className="text-red-400 text-xs tracking-widest uppercase mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#faf7f2" />
          </svg>
        </div>
      </section>


      {/* ── Quote banner ── */}
      <section className="py-16 px-6 text-center bg-[#faf7f2]">
        <Divider text="Nuestra promesa" />
        <blockquote className="text-3xl lg:text-5xl text-red-950 max-w-3xl mx-auto mt-8 leading-tight"
            style={{fontFamily:'Playfair Display, serif', fontStyle:'italic'}}>
          "El buen pan no necesita presentación, solo un buen mordisco."
        </blockquote>
        <p className="text-stone-400 text-sm mt-4 tracking-widest uppercase font-semibold">— Bon Pan, Pereira</p>
      </section>

      {/* ── Propuesta de valor ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone-200">
            {[
              { num: '01', title: 'Ingredientes Frescos', desc: 'Solo usamos ingredientes naturales y de primera calidad, seleccionados cada mañana para garantizar el mejor sabor.' },
              { num: '02', title: 'Recetas Artesanales', desc: 'Cada pieza es elaborada a mano siguiendo técnicas tradicionales que preservan el sabor auténtico del hojaldre.' },
              { num: '03', title: 'Listo para Llevar', desc: 'Tu pedido listo en el menor tiempo posible. Empacado con cuidado para que llegue perfecto a tus manos.' },
            ].map(f => (
              <div key={f.num} className="bg-white p-10 group hover:bg-red-950 transition-all duration-500">
                <p className="text-6xl font-black text-stone-100 group-hover:text-red-900 transition-colors mb-4"
                   style={{fontFamily:'Playfair Display, serif'}}>{f.num}</p>
                <h3 className="text-xl text-red-950 group-hover:text-white mb-3 transition-colors"
                    style={{fontFamily:'Playfair Display, serif'}}>{f.title}</h3>
                <p className="text-stone-400 group-hover:text-red-200 text-sm leading-relaxed transition-colors font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-24 px-6 bg-[#faf7f2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Divider text="Del horno para ti" />
            <h2 className="text-5xl text-red-950 mt-6 mb-4"
                style={{fontFamily:'Playfair Display, serif'}}>Destacados del Día</h2>
            <p className="text-stone-400 font-medium max-w-md mx-auto">
              Los productos que nuestros clientes no pueden dejar de pedir
            </p>
          </div>

          {loading.products ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="bg-white h-80 animate-pulse rounded" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p, i) => (
                <div key={p.id}
                  className="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  {/* Imagen/emoji */}
                  <div className={`flex items-center justify-center py-14 text-7xl relative overflow-hidden h-48
                    ${i % 2 === 0 ? 'bg-red-50' : 'bg-stone-50'}`}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.name} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                      : <span className="group-hover:scale-110 transition-transform duration-500 inline-block">{p.emoji}</span>
                    }
                  </div>

                  <div className="p-6 border-t border-stone-100">
                    <p className="text-[10px] text-red-600 font-bold tracking-[0.25em] uppercase mb-2">{p.category}</p>
                    <h3 className="text-lg text-red-950 mb-1 leading-tight"
                        style={{fontFamily:'Playfair Display, serif'}}>{p.name}</h3>
                    <p className="text-stone-400 text-xs mb-4 leading-relaxed font-medium line-clamp-2">{p.description}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-red-800 font-black text-lg">${p.price.toLocaleString()}</p>
                      <button onClick={() => addToCart(p)}
                        className="text-xs font-bold tracking-widest uppercase text-red-800 border-b-2 border-red-800
                                   hover:text-red-950 hover:border-red-950 transition-colors pb-0.5">
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <Link to="/menu"
              className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase
                         text-red-900 border-b-2 border-red-900 pb-1
                         hover:text-red-700 hover:border-red-700 transition-colors">
              Ver Todo el Menú <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Banner CTA ── */}
      <section className="bg-red-950 py-28 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-red-400 text-xs tracking-[0.4em] uppercase font-semibold mb-4">¿Listo para ordenar?</p>
          <h2 className="text-5xl lg:text-6xl text-white mb-6 leading-tight"
              style={{fontFamily:'Playfair Display, serif'}}>
            Haz tu pedido<br/><em>en línea</em>
          </h2>
          <p className="text-red-200/70 mb-10 text-lg font-light max-w-md mx-auto">
            Selecciona tus productos favoritos y los tenemos listos para ti
          </p>
          <Link to="/pedido"
            className="inline-flex items-center gap-3 bg-white text-red-950 font-bold
                       text-sm tracking-widest uppercase px-12 py-5
                       hover:bg-red-50 transition-colors shadow-2xl">
            Ordenar Ahora <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-red-950 border-t border-red-900/50 text-red-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Marca */}
            <div className="text-left">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Bon Pan" className="h-12 w-12 object-contain" />
                <div>
                  <p className="font-black text-white" style={{fontFamily:'Playfair Display,serif'}}>Bon Pan</p>
                  <p className="text-red-500 text-xs tracking-widest uppercase">Panadería Artesanal</p>
                </div>
              </div>
              <p className="text-red-400/70 text-sm leading-relaxed">
                Elaboramos cada producto con amor y los mejores ingredientes desde Pereira, Risaralda.
              </p>
            </div>

            {/* Links */}
            <div className="text-left">
              <p className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">Navegación</p>
              <div className="space-y-2">
                {[['/','/Inicio'],[ '/menu','Menú'],['/pedido','Pedido'],['/contacto','Contacto']].map(([to,l]) => (
                  <Link key={to} to={to}
                    className="block text-red-400 hover:text-white text-sm font-medium transition-colors">{l}</Link>
                ))}
              </div>
            </div>

            {/* Contacto */}
            <div className="text-left">
              <p className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">Contacto</p>
              <div className="space-y-2 text-sm text-red-400 font-medium">
                <p>📍 Calle 15 #23-45, Pereira</p>
                <p>📞 +57 310 123 4567</p>
                <p>✉️ hola@bonpan.co</p>
                <p>🕐 Lun–Vie: 6am – 7pm</p>
              </div>
            </div>
          </div>

          <div className="border-t border-red-900/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-red-600 text-xs">© 2026 Bon Pan · Todos los derechos reservados</p>
            <p className="text-red-600 text-xs">Hecho con ❤️ en Pereira, Colombia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
