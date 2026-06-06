import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ShoppingCart, Check } from 'lucide-react'
import { api } from '../services/api'

const ALL = 'Todos'

export default function Menu() {
  const { products, addToCart, loading } = useApp()
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [added, setAdded]   = useState(null)
  const [search, setSearch] = useState('')
  const [promociones, setPromociones] = useState([])

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
    <div className="bg-white">

      {/* Header editorial */}
      <div className="bg-stone-900 pt-16 sm:pt-20 pb-14 sm:pb-20 px-5 sm:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-stone-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3 sm:mb-4">Catálogo</p>
          <h1 className="text-5xl sm:text-7xl text-white font-black leading-none"
              style={{fontFamily:'Playfair Display, serif'}}>
            Nuestro<br/>Menú.
          </h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">

        {/* Barra de búsqueda + categorías */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between mb-10 sm:mb-12 border-b border-stone-200 pb-6">
          {/* Categorías */}
          <div className="flex gap-0 flex-wrap overflow-x-auto">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 sm:px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 mr-1 mb-1
                  ${activeCategory === c
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                {c}
              </button>
            ))}
          </div>
          {/* Búsqueda */}
          <input type="text" placeholder="Buscar..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border-b-2 border-stone-200 bg-transparent px-2 py-2
                       text-stone-700 font-medium focus:outline-none focus:border-stone-900
                       placeholder:text-stone-300 transition-colors text-sm w-full sm:w-48" />
        </div>

        {/* Promociones activas */}
        {promociones.length > 0 && (
          <div className="mb-10 sm:mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-4">
              Promociones disponibles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200">
              {promociones.map(p => (
                <div key={p.id} className="bg-white group overflow-hidden">
                  {p.imagen && (
                    <div className="h-36 overflow-hidden relative">
                      <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1">
                        {p.tipo === 'porcentaje' ? `${p.valor}% OFF` : `-$${Number(p.valor).toLocaleString()}`}
                      </div>
                      {p.precio && (
                        <div className="absolute bottom-3 left-3 bg-white text-stone-900 font-black text-sm px-3 py-1 shadow">
                          ${Number(p.precio).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`p-4 ${!p.imagen ? 'flex items-center gap-4 bg-stone-900' : ''}`}>
                    {!p.imagen && (
                      <div className="w-12 h-12 bg-red-600 flex items-center justify-center shrink-0 font-black text-white text-sm">
                        {p.tipo === 'porcentaje' ? `${p.valor}%` : `OFF`}
                      </div>
                    )}
                    <div>
                      <p className={`font-bold text-sm ${p.imagen ? 'text-stone-900' : 'text-white'}`}>{p.nombre}</p>
                      {p.descripcion && <p className={`text-xs mt-0.5 line-clamp-1 ${p.imagen ? 'text-stone-400' : 'text-stone-400'}`}>{p.descripcion}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {p.codigo && (
                          <span className={`font-mono font-black text-xs px-2 py-0.5 ${p.imagen ? 'bg-stone-100 text-stone-700' : 'bg-white text-stone-900'}`}>
                            {p.codigo}
                          </span>
                        )}
                        {p.fecha_fin && (
                          <span className="text-xs text-stone-400">
                            Hasta {new Date(p.fecha_fin).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-stone-400 text-xs tracking-widest uppercase font-semibold mb-6 sm:mb-8">
            {filtered.length} productos
          </p>
        )}

        {/* Grid de productos */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-stone-400 font-semibold">No encontramos resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-stone-200">
            {filtered.map(p => (
              <div key={p.id} className="group bg-white overflow-hidden">
                {/* Imagen */}
                <div className="relative h-36 sm:h-52 overflow-hidden bg-stone-100">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl">{p.emoji}</div>
                  }
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Agotado</span>
                    </div>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold tracking-widest uppercase bg-orange-500 text-white px-2 py-1">
                      ¡Últimos!
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5 border-t border-stone-100">
                  <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase mb-1">{p.category}</p>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1 leading-tight"
                      style={{fontFamily:'Playfair Display, serif'}}>{p.name}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2 hidden sm:block">{p.description}</p>

                  <div className="flex items-center justify-between">
                    <p className="font-black text-red-600 text-sm sm:text-base">${p.price.toLocaleString()}</p>
                    <button onClick={() => handleAdd(p)} disabled={p.stock === 0}
                      className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold tracking-widest uppercase
                        transition-all duration-200 py-1.5 px-2 sm:px-3 border
                        ${p.stock === 0
                          ? 'text-stone-300 border-stone-200 cursor-not-allowed'
                          : added === p.id
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900'}`}>
                      {added === p.id
                        ? <><Check size={11} /> Listo</>
                        : p.stock === 0 ? 'Agotado'
                        : <><ShoppingCart size={11} /> Agregar</>}
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
