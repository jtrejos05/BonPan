import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { ShoppingCart, Check } from 'lucide-react'
import { api } from '../services/api'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const ALL = 'Todos'

/* ─── Variantes ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}

/* ─── Tarjeta de producto ────────────────────── */
function ProductCard({ p, index, onAdd, added }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="group bg-white overflow-hidden flex flex-col">

      {/* Imagen */}
      <div className="relative overflow-hidden bg-stone-100 h-44 sm:h-60">
        {p.imagen
          ? <img src={p.imagen} alt={p.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          : <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl
                            group-hover:scale-110 transition-transform duration-500">
              {p.emoji}
            </div>
        }
        {/* Badge agotado */}
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Agotado</span>
          </div>
        )}
        {/* Badge últimos */}
        {p.stock > 0 && p.stock <= 5 && (
          <span className="absolute top-3 left-3 bg-amber-400 text-stone-900 text-[9px] font-black tracking-widest uppercase px-2.5 py-1">
            ¡Últimos!
          </span>
        )}
        {/* Overlay hover con precio */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-all duration-500" />
      </div>

      {/* Info */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 border-t border-stone-100">
        <p className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase mb-1.5">{p.category}</p>
        <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight mb-2"
            style={{fontFamily:'Playfair Display, serif'}}>{p.name}</h3>
        <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2 flex-1 hidden sm:block">{p.description}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
          <p className="font-black text-stone-900 text-base sm:text-lg">${p.price.toLocaleString()}</p>
          <button
            onClick={() => onAdd(p)}
            disabled={p.stock === 0}
            className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase
              transition-all duration-300 py-2 px-3 sm:px-4 border touch-manipulation
              ${p.stock === 0
                ? 'text-stone-300 border-stone-200 cursor-not-allowed'
                : added === p.id
                  ? 'bg-amber-400 text-stone-900 border-amber-400 scale-95'
                  : 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'}`}>
            {added === p.id
              ? <><Check size={11} /> Listo</>
              : p.stock === 0 ? 'Agotado'
              : <><ShoppingCart size={11} /> Agregar</>}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Tarjeta de promoción ───────────────────── */
function PromoCard({ p, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="group bg-white overflow-hidden">
      {p.imagen && (
        <div className="h-36 sm:h-44 overflow-hidden relative">
          <img src={p.imagen} alt={p.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div className="absolute top-3 right-3 bg-stone-900 text-white text-xs font-black px-2.5 py-1">
            {p.tipo === 'porcentaje' ? `${p.valor}% OFF` : `-$${Number(p.valor).toLocaleString()}`}
          </div>
          {p.precio && (
            <div className="absolute bottom-3 left-3 bg-amber-400 text-stone-900 font-black text-sm px-3 py-1">
              ${Number(p.precio).toLocaleString()}
            </div>
          )}
        </div>
      )}
      <div className={`p-4 ${!p.imagen ? 'flex items-center gap-4 bg-stone-900' : ''}`}>
        {!p.imagen && (
          <div className="w-12 h-12 bg-amber-400 flex items-center justify-center shrink-0 font-black text-stone-900 text-sm">
            {p.tipo === 'porcentaje' ? `${p.valor}%` : 'OFF'}
          </div>
        )}
        <div>
          <p className={`font-bold text-sm ${p.imagen ? 'text-stone-900' : 'text-white'}`}>{p.nombre}</p>
          {p.descripcion && (
            <p className={`text-xs mt-0.5 line-clamp-1 ${p.imagen ? 'text-stone-400' : 'text-stone-400'}`}>
              {p.descripcion}
            </p>
          )}
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
    </motion.div>
  )
}

/* ─── Banner inferior ───────────────────────── */
function BottomBanner() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9 }}
      className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="relative h-52 sm:h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504093898956-c318a39e9eee?w=900&q=80"
          alt="Pan artesanal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/30" />
      </div>
      <div className="bg-amber-300 flex items-center px-8 sm:px-12 py-12">
        <div>
          <p className="text-amber-700 text-xs tracking-[0.4em] uppercase font-bold mb-3">¿Listo para pedir?</p>
          <h3 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 leading-tight"
              style={{fontFamily:'Playfair Display,serif'}}>
            Tu pedido,<br/>en 15 minutos.
          </h3>
          <p className="text-stone-700 text-sm leading-relaxed mb-6 font-light">
            Retiro en tienda o domicilio. Todo listo cuando llegues.
          </p>
          <a href="/pedido"
            className="inline-flex items-center gap-2 bg-stone-900 text-white font-bold
                       text-xs tracking-[0.2em] uppercase px-8 py-3.5
                       hover:bg-stone-700 transition-colors">
            Ir al carrito →
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════ */
export default function Menu() {
  const { products, addToCart, loading } = useApp()
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [added,          setAdded]          = useState(null)
  const [search,         setSearch]         = useState('')
  const [promociones,    setPromociones]    = useState([])

  // Parallax header
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY   = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroTextY  = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    api.promociones.getActivas().then(setPromociones).catch(() => {})
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
    setTimeout(() => setAdded(null), 1400)
  }

  if (loading.products) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl mb-4">🥐</motion.p>
        <p className="text-stone-400 font-semibold tracking-widest uppercase text-xs">Cargando menú...</p>
      </div>
    </div>
  )

  return (
    <div className="bg-white text-stone-900 overflow-x-hidden">

      {/* ══════════════════════════════════════
          HERO con parallax
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[65vh] sm:h-[80vh] flex items-end overflow-hidden">
        {/* Imagen fondo */}
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1800&q=90"
            alt="Menú Bon Pan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/55 to-stone-900/10" />
        </motion.div>

        {/* Texto */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-12 sm:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-stone-400 text-xs tracking-[0.5em] uppercase font-semibold mb-4">
            — Catálogo
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-6xl sm:text-8xl lg:text-[110px] text-white font-black leading-none"
            style={{fontFamily:'Playfair Display, serif'}}>
            Nuestro<br/>
            <span className="text-amber-300">Menú.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9 }}
            className="text-stone-300 text-base sm:text-lg font-light mt-5 max-w-lg leading-relaxed">
            Todo elaborado a mano, fresco desde las 6am.
          </motion.p>
        </motion.div>
      </section>


      {/* ══════════════════════════════════════
          FILTROS + BÚSQUEDA
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="sticky top-[58px] sm:top-[78px] z-40 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4
                        flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
          {/* Categorías */}
          <div className="flex gap-1 flex-wrap overflow-x-auto pb-0.5">
            {categories.map(c => (
              <motion.button
                key={c}
                onClick={() => setActiveCategory(c)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 whitespace-nowrap
                  ${activeCategory === c
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                {c}
              </motion.button>
            ))}
          </div>
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-b-2 border-stone-200 bg-transparent px-2 py-2
                       text-stone-700 font-medium focus:outline-none focus:border-stone-900
                       placeholder:text-stone-300 transition-colors text-sm w-full sm:w-52" />
        </div>
      </motion.div>


      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">

        {/* ══ PROMOCIONES ══ */}
        {promociones.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-stone-200" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-500 shrink-0">
                🔥 Promociones activas
              </p>
              <div className="h-px flex-1 bg-stone-200" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200">
              {promociones.map((p, i) => (
                <PromoCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </div>
        )}


        {/* ══ CONTADOR ══ */}
        <motion.div
          key={activeCategory + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 mb-8 sm:mb-10">
          <div className="h-px flex-1 bg-stone-100" />
          <p className="text-stone-400 text-xs tracking-widest uppercase font-semibold shrink-0">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="h-px flex-1 bg-stone-100" />
        </motion.div>


        {/* ══ GRID DE PRODUCTOS ══ */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-stone-400 font-semibold text-lg">Sin resultados.</p>
            <p className="text-stone-300 text-sm mt-1">Prueba con otra búsqueda o categoría</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory + search}
            initial="hidden"
            animate="show"
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-stone-200">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                index={i}
                onAdd={handleAdd}
                added={added}
              />
            ))}
          </motion.div>
        )}


        {/* ══ BANNER INFERIOR ══ */}
        {filtered.length > 0 && <BottomBanner />}

      </div>
    </div>
  )
}
