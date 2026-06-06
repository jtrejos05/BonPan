import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ShoppingCart, Check, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../services/api'

const ALL = 'Todos'

export default function Menu() {
  const { products, addToCart, loading } = useApp()
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [added, setAdded]   = useState(null)
  const [search, setSearch] = useState('')

  const [promociones,  setPromociones]  = useState([])
  const [promoIndex,   setPromoIndex]   = useState(0)

  useEffect(() => {
    api.promociones.getActivas()
      .then(data => setPromociones(data))
      .catch(() => {})
  }, [])

  const categories = [ALL, ...new Set(products.map(p => p.category))]
  const filtered   = products.filter(p => {
    const matchCat    = activeCategory === ALL || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleAdd(p) {
    addToCart(p)
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1200)
  }

  if (loading.products) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-4xl animate-pulse mb-3">🥐</p>
        <p className="text-stone-400 font-semibold tracking-widest uppercase text-sm">Cargando...</p>
      </div>
    </div>
  )

  return (
    <div className="bg-[#faf7f2]">
      {/* Header editorial */}
      <div className="bg-red-950 pt-20 pb-0 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative z-10 pb-16">
          <p className="text-red-400 text-xs tracking-[0.4em] uppercase font-semibold mb-4">Catálogo</p>
          <h1 className="text-6xl text-white mb-4" style={{fontFamily:'Playfair Display, serif'}}>
            Nuestro Menú
          </h1>
          <p className="text-red-200/70 font-light text-lg max-w-md mx-auto">
            Todo elaborado a mano, fresco cada mañana
          </p>
        </div>
        {/* Wave */}
        <svg viewBox="0 0 1440 60" className="w-full block" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#faf7f2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="max-w-lg mx-auto mb-10">
          <input type="text" placeholder="Buscar en el menú..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border-0 border-b-2 border-stone-300 bg-transparent px-4 py-3
                       text-stone-700 font-medium focus:outline-none focus:border-red-800
                       placeholder:text-stone-400 transition-colors text-center tracking-wide" />
        </div>

        {/* Categories — estilo tabs elegante */}
        <div className="flex gap-0 flex-wrap justify-center mb-14 border-b border-stone-200">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-200 border-b-2 -mb-px
                ${activeCategory === c
                  ? 'border-red-800 text-red-800'
                  : 'border-transparent text-stone-400 hover:text-red-700 hover:border-red-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Promociones activas */}
        {promociones.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 text-center mb-4">
              🎉 Promociones disponibles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {promociones.map(p => (
                <div key={p.id}
                  className="flex items-center gap-4 bg-red-950 text-white px-5 py-4 relative overflow-hidden">
                  {/* Fondo decorativo */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-900/40" />
                  <div className="w-12 h-12 bg-red-800 rounded flex items-center justify-center shrink-0 text-xl font-black"
                       style={{fontFamily:'Playfair Display,serif'}}>
                    {p.tipo === 'porcentaje' ? `${p.valor}%` : `-$${Number(p.valor) >= 1000 ? Math.round(p.valor/1000)+'K' : p.valor}`}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="font-black text-sm leading-tight truncate">{p.nombre}</p>
                    {p.descripcion && <p className="text-red-200 text-xs mt-0.5 truncate">{p.descripcion}</p>}
                    {p.codigo && (
                      <span className="inline-block mt-1 bg-white text-red-950 font-black text-xs px-2 py-0.5 font-mono tracking-widest">
                        {p.codigo}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-center text-stone-400 text-xs tracking-widest uppercase font-semibold mb-10">
            {filtered.length} productos disponibles
          </p>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-stone-400 font-semibold">No encontramos resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-stone-200">
            {filtered.map((p, i) => (
              <div key={p.id}
                className="group bg-[#faf7f2] hover:bg-white transition-all duration-300 text-left">
                {/* Imagen o Emoji */}
                <div className={`flex items-center justify-center py-12 text-6xl relative overflow-hidden h-44
                  ${i % 3 === 0 ? 'bg-red-50' : i % 3 === 1 ? 'bg-stone-50' : 'bg-amber-50/50'}`}>
                  {p.imagen
                    ? <img src={p.imagen} alt={p.name} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                    : <span className="group-hover:scale-110 transition-transform duration-500 block">{p.emoji}</span>
                  }
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Agotado</span>
                    </div>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase bg-orange-500 text-white px-2 py-1">
                      ¡Últimos!
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 border-t border-stone-200">
                  <p className="text-[10px] text-red-600 font-bold tracking-[0.25em] uppercase mb-1">{p.category}</p>
                  <h3 className="text-lg text-red-950 mb-2 leading-tight"
                      style={{fontFamily:'Playfair Display, serif'}}>{p.name}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed mb-4 font-medium line-clamp-2">{p.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <p className="font-black text-red-800">${p.price.toLocaleString()}</p>
                    <button onClick={() => handleAdd(p)} disabled={p.stock === 0}
                      className={`flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase
                        transition-all duration-200 py-1.5 px-3
                        ${p.stock === 0
                          ? 'text-stone-300 cursor-not-allowed'
                          : added === p.id
                            ? 'bg-green-600 text-white px-4'
                            : 'border border-red-800 text-red-800 hover:bg-red-800 hover:text-white'}`}>
                      {added === p.id
                        ? <><Check size={12} /> Listo</>
                        : p.stock === 0 ? 'Agotado'
                        : <><ShoppingCart size={12} /> Agregar</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
