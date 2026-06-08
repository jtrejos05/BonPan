import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServerError from '../components/ServerError'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { api } from '../services/api'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'

/* ─── Variantes ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15 } },
}

/* ─── Wrapper con reveal al scroll ─────────── */
function Reveal({ children, className = '', delay = 0, y = 48 }) {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}>
      {children}
    </motion.div>
  )
}

function RevealSection({ children, className = '' }) {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={stagger}>
      {children}
    </motion.div>
  )
}

/* ─── Sección de producto hero ─────────────── */
function ProductHero({ img, tag, title, sub, price, reverse, onAdd, p }) {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })

  return (
    <div ref={ref} className={`grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]`}>
      {/* Imagen */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className={`relative overflow-hidden bg-stone-100 h-72 sm:h-96 lg:h-auto ${reverse ? 'lg:order-2' : ''}`}>
        <img src={img} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
      </motion.div>

      {/* Texto */}
      <div className={`flex items-center px-8 sm:px-12 lg:px-16 py-14 lg:py-0 bg-white ${reverse ? 'lg:order-1' : ''}`}>
        <div className="max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-xs tracking-[0.4em] uppercase text-stone-400 font-semibold mb-4">
            {tag}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 leading-none mb-6"
            style={{fontFamily:'Elms Sans, sans-serif'}}>
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 font-light">
            {sub}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center gap-6 flex-wrap">
            <span className="text-3xl font-black text-stone-900">${price}</span>
            {p && (
              <button onClick={() => onAdd(p)}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs font-bold
                           tracking-[0.2em] uppercase px-7 py-3.5
                           hover:bg-stone-700 active:bg-stone-900 transition-colors duration-200 touch-manipulation">
                Agregar al carrito <ArrowRight size={14} />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ─── Galería ───────────────────────────────── */
function Gallery() {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  const imgs = [
    { src: 'https://images.unsplash.com/photo-1504093898956-c318a39e9eee?w=800&q=80', alt: 'Pan artesanal' },
    { src: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80', alt: 'Croissants frescos' },
    { src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', alt: 'Pan recién horneado' },
  ]
  return (
    <motion.section
      ref={ref}
      initial="hidden" animate={inView ? 'show' : 'hidden'} variants={stagger}
      className="grid grid-cols-3 gap-px bg-stone-200">
      {imgs.map((img, i) => (
        <motion.div key={i} variants={fadeIn}
          className="relative overflow-hidden h-40 sm:h-64 lg:h-96 bg-stone-100 group">
          <img src={img.src} alt={img.alt}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </motion.div>
      ))}
    </motion.section>
  )
}

/* ─── Sección "Cuando tú duermes…" ─────────── */
function CraftSection() {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  return (
    <section ref={ref} className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
        className="relative overflow-hidden h-72 sm:h-96 lg:h-auto">
        <img
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&q=90"
          alt="Panadero artesanal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>
      <div className="bg-amber-300 flex items-center px-8 sm:px-14 lg:px-16 py-16">
        <div className="max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-amber-800 text-xs tracking-[0.4em] uppercase font-bold mb-5">
            El proceso
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight mb-6"
            style={{fontFamily:'Elms Sans, sans-serif'}}>
            Cuando tú duermes,<br/>nosotros horneamos.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-stone-700 text-base sm:text-lg leading-relaxed mb-8 font-light">
            Cada día desde las 6am nuestro equipo prepara todo a mano. Sin fábricas, sin congelados. Solo ingredientes reales y recetas de toda la vida.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.8 }}>
            <Link to="/contacto"
              className="inline-flex items-center gap-2 bg-stone-900 text-white font-bold
                         text-xs tracking-[0.2em] uppercase px-8 py-4
                         hover:bg-stone-700 transition-colors">
              Dónde encontrarnos <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA Final ─────────────────────────────── */
function FinalCTA() {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  return (
    <section ref={ref} className="relative min-h-[70vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 1.1 }} animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=1800&q=90"
          alt="Pan Bon Pan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/75" />
      </motion.div>
      <div className="relative z-10 text-center px-5 sm:px-8 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-stone-400 text-xs tracking-[0.5em] uppercase font-semibold mb-6">
          ¿Tienes hambre?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 1, ease: [0.25,0.1,0.25,1] }}
          className="text-5xl sm:text-7xl lg:text-9xl text-white font-black leading-none mb-8"
          style={{fontFamily:'Elms Sans, sans-serif'}}>
          Haz tu pedido<br/>
          <span className="text-amber-300">ahora.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.9 }}
          className="text-stone-400 text-lg sm:text-xl font-light mb-10 leading-relaxed">
          Domicilio o retiro en tienda. Listo en 15–20 minutos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/pedido"
            className="inline-flex items-center justify-center gap-2 bg-amber-300 text-stone-900
                       font-black text-sm tracking-[0.2em] uppercase px-12 py-5
                       hover:bg-amber-200 transition-colors duration-200">
            Ordenar Ahora <ArrowRight size={16} />
          </Link>
          <Link to="/menu"
            className="inline-flex items-center justify-center gap-2 border border-white/30
                       text-white font-semibold text-xs tracking-[0.2em] uppercase px-12 py-5
                       hover:bg-white/10 transition-colors">
            Ver el Menú
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Stats ─────────────────────────────────── */
function Stats() {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.05, margin: '0px 0px -40px 0px' })
  return (
    <section ref={ref} className="bg-stone-900 py-14 sm:py-20 px-5 sm:px-8">
      <motion.div
        initial="hidden" animate={inView ? 'show' : 'hidden'} variants={stagger}
        className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-0 sm:divide-x divide-stone-800">
        {[
          { n: '6am',  label: 'Abrimos cada día'     },
          { n: '15+',  label: 'Años horneando'        },
          { n: '100%', label: 'Ingredientes naturales' },
          { n: '0',    label: 'Conservantes'          },
        ].map(s => (
          <motion.div key={s.n} variants={fadeUp} className="text-center sm:px-8">
            <p className="text-4xl sm:text-6xl font-black text-amber-300 mb-2"
               style={{fontFamily:'Elms Sans, sans-serif'}}>{s.n}</p>
            <p className="text-stone-500 text-xs tracking-[0.2em] uppercase font-semibold">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════ */
export default function Home() {
  const { addToCart, products, loading, error } = useApp()
  const [promociones, setPromociones] = useState([])
  const heroRef = useRef(null)

  // Parallax hero
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroImgY    = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroTextY   = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])

  useEffect(() => {
    api.promociones.getActivas().then(setPromociones).catch(() => {})
  }, [])

  if (error) return <ServerError message={error} />

  const [p1, p2, p3] = products

  return (
    <div className="bg-white text-stone-900 overflow-x-hidden" style={{fontFamily:'Elms Sans, sans-serif'}}>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=1800&q=90"
            alt="Croissants artesanales Bon Pan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
        </motion.div>

        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-stone-400 text-xs tracking-[0.5em] uppercase font-semibold mb-5">
            — Panadería Artesanal · Ibagué, Colombia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-6xl sm:text-8xl lg:text-[120px] text-white font-black leading-none mb-8"
            style={{fontFamily:'Elms Sans, sans-serif'}}>
            Hecho a mano.<br/>
            <span className="text-amber-300">Con amor.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="text-stone-300 text-lg sm:text-xl font-light max-w-xl leading-relaxed mb-10">
            Croissants dorados, pasteles de pollo y carne. Recién salidos del horno cada mañana.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4">
            <Link to="/menu"
              className="inline-flex items-center justify-center gap-2 bg-white text-stone-900
                         font-bold text-xs tracking-[0.2em] uppercase px-10 py-4
                         hover:bg-amber-300 transition-colors duration-300">
              Ver Menú <ArrowRight size={15} />
            </Link>
            <Link to="/pedido"
              className="inline-flex items-center justify-center gap-2 border border-white/30
                         text-white font-semibold text-xs tracking-[0.2em] uppercase px-10 py-4
                         hover:bg-white/10 transition-colors duration-300">
              Ordenar Ahora
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ArrowDown size={20} className="text-white/40" />
          </motion.div>
        </motion.div>
      </section>


      {/* ── FRASE ── */}
      <section className="py-20 sm:py-32 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal delay={0.1}>
            <p className="text-xs tracking-[0.5em] uppercase text-stone-400 font-semibold mb-6">Nuestra promesa</p>
          </Reveal>
          <Reveal delay={0.2} y={60}>
            <h2 className="text-4xl sm:text-6xl lg:text-8xl text-stone-900 font-black leading-tight"
                style={{fontFamily:'Elms Sans, sans-serif'}}>
              "El mejor pan<br/>
              <em className="text-amber-500 not-italic">que vas a probar</em><br/>
              en Ibagué."
            </h2>
          </Reveal>
        </div>
      </section>


      {/* ── IMAGEN CINEMÁTICA ── */}
      <Reveal y={0} className="relative h-[55vh] sm:h-[75vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=1800&q=90"
          alt="Croissant de chocolate Bon Pan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <Reveal delay={0.3} className="absolute bottom-8 sm:bottom-14 left-5 sm:left-14 bg-white/95 backdrop-blur px-6 sm:px-8 py-5 sm:py-6 max-w-xs sm:max-w-sm shadow-2xl">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 font-semibold mb-2">Recién salido del horno</p>
          <p className="text-xl sm:text-2xl font-black text-stone-900" style={{fontFamily:'Elms Sans, sans-serif'}}>
            Hojaldrado y dorado,<br/>cada mañana.
          </p>
        </Reveal>
      </Reveal>


      {/* ── STATS ── */}
      <Stats />


      {/* ── PRODUCTOS HERO ── */}
      <section>
        <ProductHero
          img="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=90"
          tag="Nuestra especialidad"
          title="Croissant Clásico."
          sub="Capas perfectas de masa hojaldrada, mantequilla real y un dorado que te va a enloquecer. Crujiente por fuera, suave por dentro."
          price={p1 ? p1.price.toLocaleString() : '4.500'}
          p={p1} onAdd={addToCart} reverse={false}
        />
        <div className="h-px bg-stone-100" />
        <ProductHero
          img="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=1200&q=90"
          tag="El favorito de todos"
          title="Pastel de Pollo."
          sub="Relleno generoso de pollo, con masa que se deshace en la boca. El que más piden, el que nunca falta."
          price={p2 ? p2.price.toLocaleString() : '5.000'}
          p={p2} onAdd={addToCart} reverse={true}
        />
        <div className="h-px bg-stone-100" />
        <ProductHero
          img="https://images.unsplash.com/photo-1586444248879-bc604cbd555a?w=1200&q=90"
          tag="Sabor intenso"
          title="Pastel de Carne."
          sub="Masa hojaldrada con relleno de carne sazonada al estilo Bon Pan. Un bocado y ya no puedes parar."
          price={p3 ? p3.price.toLocaleString() : '5.000'}
          p={p3} onAdd={addToCart} reverse={false}
        />
      </section>


      {/* ── CRAFT ── */}
      <CraftSection />


      {/* ── GALERÍA ── */}
      <Gallery />


      {/* ── PROMO (si hay) ── */}
      <AnimatePresence>
        {promociones.length > 0 && (
          <Reveal className="bg-red-600 py-14 sm:py-20 px-5 sm:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-red-200 text-xs tracking-[0.3em] uppercase font-semibold mb-2">🔥 Oferta especial</p>
                <h2 className="text-3xl sm:text-5xl text-white font-black" style={{fontFamily:'Elms Sans, sans-serif'}}>
                  {promociones[0].nombre}
                </h2>
                {promociones[0].descripcion && (
                  <p className="text-red-100 mt-2 text-base font-light">{promociones[0].descripcion}</p>
                )}
              </div>
              <Link to="/menu"
                className="shrink-0 inline-flex items-center gap-2 bg-white text-red-600 font-bold
                           text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-red-50 transition-colors">
                Ver en el Menú <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        )}
      </AnimatePresence>


      {/* ── CTA FINAL ── */}
      <FinalCTA />


      {/* ── FOOTER ── */}
      <footer className="bg-stone-950 text-stone-500">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Bon Pan" className="h-10 w-10 object-contain" />
                <div>
                  <p className="font-black text-white text-lg" style={{fontFamily:'Elms Sans, sans-serif'}}>Bon Pan</p>
                  <p className="text-stone-600 text-xs tracking-widest uppercase">Panadería Artesanal</p>
                </div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">
                Elaboramos cada producto con amor desde Ibagué, Tolima.
              </p>
            </div>
            <div>
              <p className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">Páginas</p>
              <div className="space-y-2.5">
                {[['/', 'Inicio'],['/menu','Menú'],['/pedido','Pedido'],['/contacto','Contacto']].map(([to, l]) => (
                  <Link key={to} to={to}
                    className="block text-stone-600 hover:text-white text-sm transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <p className="text-white text-xs tracking-[0.2em] uppercase font-bold mb-4">Contacto</p>
              <div className="space-y-2 text-sm text-stone-600">
                <p>📍 Ibagué, Tolima</p>
                <p>📞 +57 310 123 4567</p>
                <p>✉️ hola@bonpan.co</p>
                <p>🕐 Lun–Vie: 6am – 7pm · Sáb–Dom: 7am – 5pm</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-stone-700 text-xs">© 2026 Bon Pan · Todos los derechos reservados</p>
            <p className="text-stone-700 text-xs">Hecho con ❤️ en Ibagué, Colombia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
