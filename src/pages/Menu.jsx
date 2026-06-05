import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ShoppingCart, Check } from 'lucide-react'

// Categorías derivadas de los productos reales
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

  if (loading.products) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-stone-400">
        <div className="text-5xl mb-3 animate-pulse">🥐</div>
        <p className="font-medium">Cargando productos...</p>
      </div>
    </div>
  )

  function handleAdd(p) {
    addToCart(p)
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-red-900 mb-2">Nuestro Menú</h1>
        <p className="text-stone-500 font-medium">Productos hojaldrados frescos, horneados cada día</p>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="🔍  Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-stone-200 rounded-full px-5 py-3 text-stone-700 focus:outline-none focus:border-red-400 bg-white shadow-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-3 flex-wrap justify-center mb-8">
        {categories.map(c => (
          <button key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors
              ${activeCategory === c
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-red-400'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>No encontramos productos con ese nombre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 text-left">
              <div className="bg-red-50 flex items-center justify-center py-8 text-6xl">
                {p.emoji}
              </div>
              <div className="p-4">
                <span className="text-xs text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-full">{p.category}</span>
                <h3 className="font-bold text-red-900 mt-2">{p.name}</h3>
                <p className="text-stone-500 text-xs mt-1 mb-3 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-bold">${p.price.toLocaleString()}</span>
                  <button
                    onClick={() => handleAdd(p)}
                    disabled={p.stock === 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors
                      ${p.stock === 0
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : added === p.id
                          ? 'bg-green-500 text-white'
                          : 'bg-red-700 text-white hover:bg-red-800'}`}>
                    {added === p.id
                      ? <><Check size={14} /> ¡Listo!</>
                      : p.stock === 0
                        ? 'Sin stock'
                        : <><ShoppingCart size={14} /> Agregar</>}
                  </button>
                </div>
                {p.stock > 0 && p.stock <= 5 && (
                  <p className="text-orange-500 text-xs mt-2">⚠️ Solo quedan {p.stock}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
