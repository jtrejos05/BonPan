import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServerError from '../components/ServerError'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Home() {
  const { addToCart, products, loading, error } = useApp()
  const featured = products.slice(0, 3)
  const [promociones, setPromociones] = useState([])

  useEffect(() => {
    api.promociones.getActivas()
      .then(data => setPromociones(data))
      .catch(() => {})
  }, [])

  if (error) return <ServerError message={error} />

  return (
    <div className="bg-white text-stone-900">

      {/* ── HERO ── */}
      <section className="relative bg-stone-900 overflow-hidden min-h-[85vh] sm:min-h-screen flex items-end">
        {/* Imagen de fondo — degradado sobre ella */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-stone-900/10" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <p className="text-stone-400 text-xs tracking-[0.4em] uppercase font-semibold mb-4 sm:mb-6">
            Panadería Artesanal · Ibagué
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl text-white font-black leading-none mb-6 sm:mb-8 max-w-3xl"
              style={{fontFamily:'Playfair Display, serif'}}>
            Pan que hace feliz.
          </h1>
          <p className="text-stone-300 text-base sm:text-xl font-light mb-8 sm:mb-10 max-w-lg leading-relaxed">
            Croissants, pasteles de pollo y carne. Todo hecho a mano desde las 6am, todos los días.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-white text-stone-900
                         font-bold text-xs tracking-[0.2em] uppercase px-8 py-4
                         hover:bg-stone-100 transition-colors duration-200">
              Ver Menú <ArrowRight size={15} />
            </Link>
            <Link to="/pedido"
              className="inline-flex items-center justify-center gap-2 border border-white/40
                         text-white font-semibold text-xs tracking-[0.2em] uppercase px-8 py-4
                         hover:bg-white/10 transition-colors duration-200">
              Ordenar Ahora
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 right-6 sm:right-10 flex flex-col items-center gap-2 z-10">
          <div className="w-px h-10 sm:h-14 bg-white/30" />
          <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase rotate-90 origin-center mt-4">Scroll</span>
        </div>
      </section>


      {/* ── MANIFIESTO ── */}
      <section className="py-20 sm:py-32 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-stone-400 font-semibold mb-5 sm:mb-6">Nuestra filosofía</p>
            <h2 className="text-3xl sm:text-5xl text-stone-900 leading-tight mb-6 sm:mb-8"
                style={{fontFamily:'Playfair Display, serif'}}>
              Cada pieza es elaborada a mano, sin atajos.
            </h2>
            <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-4">
              En Bon Pan creemos que el pan de verdad se hace con tiempo, dedicación y los mejores ingredientes.
              Nada de aditivos, nada de prisa.
            </p>
            <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
              Cada croissant, cada pastel de pollo y cada hojaldrado sale del horno listo para hacerte el día mejor.
            </p>
            <Link to="/menu"
              className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase
                         text-stone-900 border-b-2 border-stone-900 pb-1
                         hover:text-stone-500 hover:border-stone-500 transition-colors">
              Conoce nuestro menú <ArrowRight size={14} />
            </Link>
          </div>

          {/* Imagen lateral */}
          <div className="relative h-72 sm:h-96 lg:h-[520px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=900&q=80"
              alt="Panadería artesanal"
              className="w-full h-full object-cover"
            />
            {/* Tag flotante */}
            <div className="absolute bottom-5 left-5 bg-white px-5 py-3 shadow-lg">
              <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-1">Desde</p>
              <p className="text-2xl font-black text-stone-900" style={{fontFamily:'Playfair Display,serif'}}>
                Las 6<span className="text-sm font-semibold">am</span>
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── PILARES ── */}
      <section className="bg-stone-50 py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-stone-400 font-semibold mb-10 sm:mb-14 text-center">
            Por qué elegirnos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            {[
              { num: '01', title: 'Ingredientes Frescos', desc: 'Seleccionados cada mañana para garantizar el mejor sabor en cada bocado.' },
              { num: '02', title: 'Recetas Artesanales', desc: 'Técnicas tradicionales que preservan el sabor auténtico del hojaldre.' },
              { num: '03', title: 'Listo para Ti', desc: 'Empacado con cuidado para que llegue perfecto a tus manos.' },
            ].map(f => (
              <div key={f.num} className="px-6 sm:px-10 py-10 sm:py-8">
                <p className="text-4xl sm:text-5xl font-black text-stone-200 mb-4"
                   style={{fontFamily:'Playfair Display, serif'}}>{f.num}</p>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── PRODUCTOS DESTACADOS ── */}
      <section className="py-20 sm:py-32 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-stone-400 font-semibold mb-3">Del horno para ti</p>
              <h2 className="text-3xl sm:text-5xl text-stone-900 leading-tight"
                  style={{fontFamily:'Playfair Display, serif'}}>Destacados del Día</h2>
            </div>
            <Link to="/menu"
              className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400
                         border-b border-stone-300 pb-0.5 hover:text-stone-900 hover:border-stone-900 transition-colors shrink-0">
              Ver todo →
            </Link>
          </div>

          {loading.products ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-stone-200">
              {[1,2,3].map(i => <div key={i} className="bg-white h-80 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-stone-200">
              {featured.map(p => (
                <div key={p.id} className="group bg-white overflow-hidden">
                  {/* Imagen */}
                  <div className="relative h-56 sm:h-72 overflow-hidden bg-stone-100">
                    {p.imagen
                      ? <img src={p.imagen} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="w-full h-full flex items-center justify-center text-6xl">{p.emoji}</div>
                    }
                  </div>
                  {/* Info */}
                  <div className="p-5 sm:p-6 border-t border-stone-100">
                    <p className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase mb-2">{p.category}</p>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight"
                          style={{fontFamily:'Playfair Display, serif'}}>{p.name}</h3>
                      <p className="text-red-600 font-black text-base shrink-0">${p.price.toLocaleString()}</p>
                    </div>
                    <p className="text-stone-400 text-xs mt-2 leading-relaxed line-clamp-2">{p.description}</p>
                    <button onClick={() => addToCart(p)}
                      className="mt-4 w-full border border-stone-200 py-2.5 text-xs font-bold tracking-[0.15em] uppercase
                                 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200">
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ── PROMO BANNER ── (solo si hay promociones activas) */}
      {promociones.length > 0 && (
        <section className="bg-red-600 py-12 sm:py-16 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-red-200 text-xs tracking-[0.3em] uppercase font-semibold mb-2">Promociones activas</p>
              <h2 className="text-2xl sm:text-4xl text-white font-black" style={{fontFamily:'Playfair Display,serif'}}>
                {promociones[0].nombre}
              </h2>
              {promociones[0].descripcion && (
                <p className="text-red-100 mt-2 text-sm font-light">{promociones[0].descripcion}</p>
              )}
            </div>
            <Link to="/menu"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-red-600 font-bold
                         text-xs tracking-[0.2em] uppercase px-8 py-4
                         hover:bg-red-50 transition-colors">
              Ver en el Menú <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}


      {/* ── IMAGEN GRANDE ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh] sm:min-h-[60vh]">
        <div className="relative h-64 sm:h-80 lg:h-auto overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80"
            alt="Croissants artesanales"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="bg-stone-900 flex items-center justify-center px-8 sm:px-16 py-16 sm:py-20">
          <div className="max-w-md">
            <p className="text-stone-500 text-xs tracking-[0.4em] uppercase font-semibold mb-5">¿Listo para ordenar?</p>
            <h2 className="text-3xl sm:text-5xl text-white leading-tight mb-6"
                style={{fontFamily:'Playfair Display, serif'}}>
              Haz tu pedido<br/>en línea.
            </h2>
            <p className="text-stone-400 text-base leading-relaxed mb-8 font-light">
              Selecciona tus productos y los tenemos listos para ti — domicilio o retiro en tienda.
            </p>
            <Link to="/pedido"
              className="inline-flex items-center gap-3 bg-white text-stone-900 font-bold
                         text-xs tracking-[0.2em] uppercase px-10 py-4
                         hover:bg-stone-100 transition-colors">
              Ordenar Ahora <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer className="bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">

            {/* Marca */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 object-contain" />
                <div>
                  <p className="font-black text-white text-lg" style={{fontFamily:'Playfair Display,serif'}}>Bon Pan</p>
                  <p className="text-stone-600 text-xs tracking-widest uppercase">Panadería Artesanal</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Elaboramos cada producto con amor desde Ibagué, Tolima.
              </p>
            </div>

            {/* Nav */}
            <div>
              <p className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">Páginas</p>
              <div className="space-y-2.5">
                {[['/', 'Inicio'],['/menu','Menú'],['/pedido','Pedido'],['/contacto','Contacto']].map(([to, l]) => (
                  <Link key={to} to={to}
                    className="block text-stone-500 hover:text-white text-sm transition-colors">{l}</Link>
                ))}
              </div>
            </div>

            {/* Contacto */}
            <div className="col-span-2 sm:col-span-2">
              <p className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">Contacto</p>
              <div className="space-y-2 text-sm text-stone-500">
                <p>📍 Ibagué, Tolima</p>
                <p>📞 +57 310 123 4567</p>
                <p>✉️ hola@bonpan.co</p>
                <p>🕐 Lun–Vie: 6am – 7pm · Sáb–Dom: 7am – 5pm</p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-stone-600 text-xs">© 2026 Bon Pan · Todos los derechos reservados</p>
            <p className="text-stone-600 text-xs">Hecho con ❤️ en Ibagué, Colombia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
