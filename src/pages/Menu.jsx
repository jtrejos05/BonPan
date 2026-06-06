import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ShoppingCart, Check, Search } from 'lucide-react'

const ALL = 'Todos'

export default function Menu() {
  const { products, addToCart, loading } = useApp()
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [added, setAdded] = useState(null)
  const [search, setSearch] = useState('')

  const categories = [ALL, ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchCat = activeCategory === ALL || p.category === activeCategory
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
        <div className="text-5xl mb-3 animate-pulse">🥐</div>
        <p className="font-semibold text-stone-500">Cargando productos...</p>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-950 to-red-800 py-16 text-center">
        <p className="text-red-300 font-bold text-sm tracking-widest uppercase mb-3">Catálogo</p>
        <h1 className="text-5xl font-black text-white mb-3" style={{fontFamily:'Montserrat,sans-serif'}}>
          Nuestro Menú
        </h1>
        <p className="text-red-200 text-lg">Productos hojaldrados frescos, horneados cada día</p>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-8 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" placeholder="Buscar productos..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border-2 border-stone-100 rounded-2xl pl-11 pr-5 py-3.5 text-stone-700
                       focus:outline-none focus:border-red-300 bg-white shadow-sm font-medium
                       placeholder:text-stone-400 transition-colors" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200
                ${activeCategory === c
                  ? 'bg-red-700 text-white shadow-md scale-105'
                  : 'bg-white text-stone-600 border-2 border-stone-100 hover:border-red-300 hover:text-red-700'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-stone-400 font-semibold">No encontramos productos con ese nombre.</p>
          </div>
        ) : (
          <>
            <p className="text-stone-400 text-sm font-medium mb-6 text-center">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => (
                <div key={p.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-10 text-6xl
                                  group-hover:from-red-100 transition-colors relative">
                    {p.emoji}
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        ¡Últimos!
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="absolute top-3 right-3 bg-stone-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {p.category}
                    </span>
                    <h3 className="font-black text-red-950 mt-2.5 mb-1 text-base leading-tight"
                        style={{fontFamily:'Montserrat,sans-serif'}}>{p.name}</h3>
                    <p className="text-stone-400 text-xs mb-4 line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-red-700 font-black text-lg">${p.price.toLocaleString()}</p>
                      <button onClick={() => handleAdd(p)} disabled={p.stock === 0}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
                          ${p.stock === 0
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : added === p.id
                              ? 'bg-green-500 text-white scale-95'
                              : 'bg-red-700 text-white hover:bg-red-800 hover:shadow-md'}`}>
                        {added === p.id
                          ? <><Check size={14} /> ¡Listo!</>
                          : p.stock === 0
                            ? 'Agotado'
                            : <><ShoppingCart size={14} /> Agregar</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
