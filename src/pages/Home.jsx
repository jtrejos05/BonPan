import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServerError from '../components/ServerError'

export default function Home() {
  const { addToCart, products, loading, error } = useApp()
  const featured = products.slice(0, 3)

  if (error) return <ServerError message={error} />

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-9xl flex flex-wrap gap-8 p-8 pointer-events-none select-none">
          {['🥐','🥐','🥧','🥐','☕','🥧','🥐','🥧'].map((e, i) => <span key={i}>{e}</span>)}
        </div>
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10 text-center">
          <img src="/logo.png" alt="Bon Pan" className="w-28 h-28 mx-auto mb-6 rounded-2xl shadow-2xl object-cover" />
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight" style={{fontFamily:'Montserrat,sans-serif'}}>Bon Pan</h1>
          <p className="text-xl md:text-2xl text-red-200 mb-2 font-semibold">Panadería Artesanal</p>
          <p className="text-red-300 mb-10 text-lg max-w-xl mx-auto">
            Croissants, pasteles de pollo y carne. Todo en masa hojaldrada, horneado con amor cada día.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu"
              className="bg-white text-red-800 font-bold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg">
              Ver Menú
            </Link>
            <Link to="/pedido"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
              Hacer Pedido
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-red-50 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🌾', title: 'Ingredientes Frescos', desc: 'Solo usamos ingredientes naturales y de primera calidad.' },
            { icon: '👨‍🍳', title: 'Horneado Artesanal', desc: 'Cada pieza es elaborada a mano con técnicas tradicionales.' },
            { icon: '🚀', title: 'Listo para Llevar', desc: 'Pedidos listos en el menor tiempo posible.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-red-900 mb-2">{f.title}</h3>
              <p className="text-stone-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-red-900 mb-2">Destacados del Día</h2>
          <p className="text-stone-500">Los favoritos de nuestros clientes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featured.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-red-50 flex items-center justify-center py-10 text-7xl">
                {p.emoji}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-red-900">{p.name}</h3>
                <p className="text-stone-500 text-sm mt-1 mb-4">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-bold text-lg">${p.price.toLocaleString()}</span>
                  <button onClick={() => addToCart(p)}
                    className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/menu" className="bg-red-700 text-white font-bold px-10 py-3 rounded-full hover:bg-red-800 transition-colors">
            Ver Menú Completo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-900 text-red-200 text-center py-8 mt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="Bon Pan" className="h-8 w-8 rounded object-cover" />
          <span className="text-xl font-black tracking-tight" style={{fontFamily:'Montserrat,sans-serif'}}>Bon Pan</span>
        </div>
        <p className="text-sm">© 2026 Bon Pan Panadería Artesanal · Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
