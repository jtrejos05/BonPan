import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { ShoppingCart, Check, X } from 'lucide-react'
import { api } from '../services/api'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'

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

/* ─── Bottom Sheet móvil ─────────────────────── */
function ProductBottomSheet({ p, onClose, onAdd, added }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      {/* Fondo oscuro */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {/* Panel */}
      <motion.div
        className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl z-10"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}>

        {/* Imagen */}
        <div className="relative h-56 bg-stone-100">
          {p.imagen
            ? <img src={p.imagen} alt={p.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-7xl">{p.emoji}</div>
          }
          {p.imagen && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <img src="/logo.png" alt="BonPan" className="w-24" style={{opacity:0.35}} />
            </div>
          )}
          {p.stock === 0 && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Agotado</span>
            </div>
          )}
          {/* Botón cerrar */}
          <button onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
            <X size={18} />
          </button>
          {/* Handle drag indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/60 rounded-full sm:hidden" />
        </div>

        {/* Info */}
        <div className="p-6">
          <p className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase mb-1">{p.category}</p>
          <h3 className="text-2xl font-black text-stone-900 leading-tight mb-3"
              style={{fontFamily:'Elms Sans, sans-serif'}}>{p.name}</h3>
          {p.description && (
            <p className="text-stone-500 text-sm leading-relaxed">{p.description}</p>
          )}
          {p.description_en && (
            <p className="text-stone-400 text-sm leading-relaxed italic mt-1 mb-5">{p.description_en}</p>
          )}
          {(p.description || p.description_en) && <div className="mb-5" />}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <p className="font-black text-stone-900 text-2xl">${p.price.toLocaleString()}</p>
            <button
              onClick={() => { onAdd(p); setTimeout(onClose, 800) }}
              disabled={p.stock === 0}
              className={`flex items-center gap-2 text-xs font-bold tracking-widest uppercase
                transition-all duration-300 py-3 px-6 border-2 touch-manipulation
                ${p.stock === 0
                  ? 'text-stone-300 border-stone-200 cursor-not-allowed'
                  : added === p.id
                    ? 'bg-amber-400 text-stone-900 border-amber-400'
                    : 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'}`}>
              {added === p.id
                ? <><Check size={13} /> Listo</>
                : p.stock === 0 ? 'Agotado'
                : <><ShoppingCart size={13} /> Agregar al carrito</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Tarjeta de producto ────────────────────── */
function ProductCard({ p, index, onAdd, added, onOpen }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onOpen}
      className="group bg-white overflow-hidden flex flex-col cursor-pointer">

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
        {p.imagen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <img src="/logo.png" alt="BonPan" className="w-16" style={{opacity:0.35}} />
          </div>
        )}
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Agotado</span>
          </div>
        )}
        {p.stock > 0 && p.stock <= 5 && (
          <span className="absolute top-3 left-3 bg-amber-400 text-stone-900 text-[9px] font-black tracking-widest uppercase px-2.5 py-1">
            ¡Últimos!
          </span>
        )}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-all duration-500" />
      </div>

      {/* Info */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 border-t border-stone-100">
        <p className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase mb-1.5">{p.category}</p>
        <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight mb-2"
            style={{fontFamily:'Elms Sans, sans-serif'}}>{p.name}</h3>
        <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2 flex-1 hidden sm:block">{p.description}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
          <p className="font-black text-stone-900 text-base sm:text-lg">${p.price.toLocaleString()}</p>
          {/* En desktop: botón directo. En móvil: se abre el sheet al tocar la tarjeta */}
          <button
            onClick={e => { e.stopPropagation(); onAdd(p) }}
            disabled={p.stock === 0}
            className={`hidden sm:flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase
              transition-all duration-300 py-2 px-4 border touch-manipulation
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
          {/* En móvil: indicador visual */}
          <span className="sm:hidden text-[10px] text-stone-400 font-bold tracking-widest uppercase">
            Ver →
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Tarjeta de promoción ───────────────────── */
function PromoCard({ p, index, onAdd }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  const [added, setAdded] = useState(false)

  // Solo se puede agregar al carrito si tiene precio
  const tieneP = p.precio && Number(p.precio) > 0

  function handleAdd() {
    if (!tieneP) return
    onAdd({
      id:          `promo-${p.id}`,
      name:        p.nombre,
      price:       Number(p.precio),
      emoji:       '🎉',
      imagen:      p.imagen || null,
      category:    'Promoción',
      description: p.descripcion || '',
      stock:       99,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="group bg-white overflow-hidden flex flex-col">
      {p.imagen && (
        <div className="h-36 sm:h-44 overflow-hidden relative">
          <img src={p.imagen} alt={p.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div className="absolute top-3 right-3 bg-stone-900 text-white text-xs font-black px-2.5 py-1">
            {p.tipo === 'porcentaje' ? `${p.valor}% OFF` : `-$${Number(p.valor).toLocaleString()}`}
          </div>
          {tieneP && (
            <div className="absolute bottom-3 left-3 bg-amber-400 text-stone-900 font-black text-sm px-3 py-1">
              ${Number(p.precio).toLocaleString()}
            </div>
          )}
        </div>
      )}
      <div className={`p-4 flex-1 flex flex-col ${!p.imagen ? 'bg-stone-900' : ''}`}>
        {!p.imagen && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-400 flex items-center justify-center shrink-0 font-black text-stone-900 text-sm">
              {p.tipo === 'porcentaje' ? `${p.valor}%` : 'OFF'}
            </div>
            {tieneP && (
              <span className="bg-white text-stone-900 font-black text-sm px-3 py-1">
                ${Number(p.precio).toLocaleString()}
              </span>
            )}
          </div>
        )}
        <div className="flex-1">
          <p className={`font-bold text-sm ${p.imagen ? 'text-stone-900' : 'text-white'}`}>{p.nombre}</p>
          {p.descripcion && (
            <p className={`text-xs mt-0.5 line-clamp-2 ${p.imagen ? 'text-stone-400' : 'text-stone-400'}`}>
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

        {/* Botón agregar — solo si tiene precio */}
        {tieneP ? (
          <button
            onClick={handleAdd}
            className={`mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-bold
                        tracking-widest uppercase py-2.5 border transition-all duration-300 touch-manipulation
                        ${added
                          ? 'bg-amber-400 text-stone-900 border-amber-400'
                          : p.imagen
                            ? 'border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white'
                            : 'border-white text-white hover:bg-white hover:text-stone-900'}`}>
            {added ? <><Check size={11} /> Agregado</> : <><ShoppingCart size={11} /> Agregar</>}
          </button>
        ) : (
          <p className={`mt-3 text-xs text-center italic ${p.imagen ? 'text-stone-400' : 'text-stone-500'}`}>
            Usa el código al pagar
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Banner inferior ───────────────────────── */
function BottomBanner() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9 }}
      className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="relative h-52 sm:h-72 overflow-hidden">
        <img
          src="/bonpanpunto.jpeg"
          alt="Pan artesanal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/30" />
      </div>
      <div className="bg-amber-300 flex items-center px-8 sm:px-12 py-12">
        <div>
          <p className="text-amber-700 text-xs tracking-[0.4em] uppercase font-bold mb-3">¿Listo para pedir?</p>
          <h3 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 leading-tight"
              style={{fontFamily:'Elms Sans, sans-serif'}}>
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

  const [activeCategory,  setActiveCategory]  = useState(ALL)
  const [added,           setAdded]           = useState(null)
  const [search,          setSearch]          = useState('')
  const [promociones,     setPromociones]     = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Parallax header
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY   = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroTextY  = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    api.promociones.getActivas().then(setPromociones).catch(() => {})
  }, [])

  const ORDEN_CATS = ['Restaurante', 'Panadería', 'Pastelería', 'Bebidas', 'Congelados']
  const catsEnUso  = new Set(products.map(p => p.category))
  const categories = [ALL, ...ORDEN_CATS.filter(c => catsEnUso.has(c)), ...[...catsEnUso].filter(c => !ORDEN_CATS.includes(c))]
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

      {/* Bottom Sheet */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductBottomSheet
            p={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={handleAdd}
            added={added}
          />
        )}
      </AnimatePresence>

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
            style={{fontFamily:'Elms Sans, sans-serif'}}>
            Nuestro<br/>
            <span className="text-amber-300">Menú.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9 }}
            className="text-stone-300 text-base sm:text-lg font-light mt-5 max-w-lg leading-relaxed">
            Todo elaborado a mano, fresco desde las 7am.
          </motion.p>
        </motion.div>
      </section>


      {/* ══════════════════════════════════════
          BARRA STICKY: navegación + búsqueda
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="sticky top-[58px] sm:top-[78px] z-40 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4
                        flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
          {/* Categorías — scroll a la sección */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {categories.filter(c => c !== ALL).map(c => (
              <motion.a
                key={c}
                href={`#cat-${c.toLowerCase().replace(/\s+/g, '-')}`}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200
                           whitespace-nowrap bg-stone-100 text-stone-500 hover:bg-stone-900 hover:text-white">
                {c}
              </motion.a>
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


      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-16">

        {/* ══ PROMOCIONES ══ */}
        {promociones.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-stone-200" />
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-500 shrink-0">
                🔥 Promociones activas
              </p>
              <div className="h-px flex-1 bg-stone-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-stone-200">
              {promociones.map((p, i) => (
                <PromoCard key={p.id} p={p} index={i} onAdd={addToCart} />
              ))}
            </div>
          </div>
        )}

        {/* ══ BÚSQUEDA ACTIVA: lista plana ══ */}
        {search ? (
          filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-stone-400 font-semibold text-lg">Sin resultados.</p>
              <p className="text-stone-300 text-sm mt-1">Prueba con otro nombre</p>
            </motion.div>
          ) : (
            <div>
              <p className="text-stone-400 text-xs tracking-widest uppercase font-semibold mb-6">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "{search}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-stone-200">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} p={p} index={i} onAdd={handleAdd} added={added} onOpen={() => setSelectedProduct(p)} />
                ))}
              </div>
            </div>
          )
        ) : (
          /* ══ SECCIONES POR CATEGORÍA ══ */
          categories.filter(c => c !== ALL).map(cat => {
            const catProducts = products.filter(p => p.category === cat && p.active !== false)
            if (catProducts.length === 0) return null
            return (
              <section key={cat} id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                {/* Título de sección */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 whitespace-nowrap"
                      style={{fontFamily:'Elms Sans, sans-serif'}}>
                    {cat}
                  </h2>
                  <div className="h-px flex-1 bg-stone-200" />
                  <span className="text-xs text-stone-400 font-semibold whitespace-nowrap">
                    {catProducts.length} producto{catProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Grid de la categoría */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-stone-200">
                  {catProducts.map((p, i) => (
                    <ProductCard key={p.id} p={p} index={i} onAdd={handleAdd} added={added} onOpen={() => setSelectedProduct(p)} />
                  ))}
                </div>
              </section>
            )
          })
        )}

        {/* ══ BANNER INFERIOR ══ */}
        <BottomBanner />

      </div>
    </div>
  )
}
