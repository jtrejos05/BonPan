import { MapPin, Phone, Clock, Mail, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'TU_SERVICE_ID'   // ← reemplazar
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID'  // ← reemplazar
const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY'   // ← reemplazar

function IgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function FbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

const INFO = [
  { icon: <MapPin size={18} />, title: 'Dirección', lines: ['Crr 6 Sur #66-40, Santafé de Varsovia Local 6', 'Ibagué, Tolima'] },
  { icon: <Phone size={18} />, title: 'Teléfono', lines: ['+57 305 306 7179'] },
  { icon: <Mail size={18} />, title: 'Correo', lines: ['hola@bonpan.co'] },
  { icon: <Clock size={18} />, title: 'Horario', lines: [
    'Lunes – Jueves: 7:00am – 12:30pm y 2:00pm – 8:00pm',
    'Viernes – Sábado: 7:00am – 8:00pm',
    'Domingo: 7:00am – 7:00pm',
  ]},
]

export default function Contact() {
  const formRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | ok | error
  return (
    <div className="bg-white">

      {/* Header */}
      <div className="bg-stone-900 pt-16 sm:pt-20 pb-14 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-stone-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3 sm:mb-4">Visítanos</p>
          <h1 className="text-5xl sm:text-7xl text-white font-black leading-none"
              style={{fontFamily:'Playfair Display, serif'}}>
            Contáctanos.
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">

          {/* Info de contacto */}
          <div>
            {INFO.map((item, i) => (
              <div key={item.title}
                className={`flex gap-5 py-6 ${i < INFO.length - 1 ? 'border-b border-stone-100' : ''}`}>
                <div className="w-10 h-10 bg-stone-900 text-white flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-1">{item.title}</p>
                  {item.lines.map(l => (
                    <p key={l} className="text-stone-700 font-medium text-sm sm:text-base">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Redes */}
            <div className="pt-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-4">Redes Sociales</p>
              <div className="flex gap-3 flex-wrap">
                <a href="https://www.instagram.com/panaderia.bonpan/?hl=es"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-2.5
                             text-xs font-bold tracking-widest uppercase hover:bg-stone-900 hover:text-white
                             hover:border-stone-900 transition-all duration-200">
                  <IgIcon /> Instagram
                </a>
                <a href="https://www.facebook.com/panaderia.bonpan?locale=es_LA"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-2.5
                             text-xs font-bold tracking-widest uppercase hover:bg-blue-700 hover:text-white
                             hover:border-blue-700 transition-all duration-200">
                  <FbIcon /> Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Mapa + Formulario */}
          <div className="space-y-6">
            <div className="overflow-hidden h-52 sm:h-64 border border-stone-100">
              <iframe title="Ubicación Bon Pan" width="100%" height="100%" style={{border:0}}
                loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=4.430097,-75.197022&output=embed" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-6"
                  style={{fontFamily:'Playfair Display, serif'}}>
                Envíanos un Mensaje
              </h2>
              <form ref={formRef} className="space-y-5" onSubmit={async (e) => {
                  e.preventDefault()
                  setStatus('sending')
                  try {
                    await emailjs.sendForm(
                      EMAILJS_SERVICE_ID,
                      EMAILJS_TEMPLATE_ID,
                      formRef.current,
                      EMAILJS_PUBLIC_KEY
                    )
                    setStatus('ok')
                    formRef.current.reset()
                  } catch {
                    setStatus('error')
                  }
                }}>
                <div className="border-b border-stone-200">
                  <input
                    name="nombre" type="text" placeholder="Tu nombre completo" required
                    className="w-full bg-transparent py-3 text-stone-700 font-medium
                               focus:outline-none placeholder:text-stone-300 text-sm" />
                </div>
                <div className="border-b border-stone-200">
                  <input
                    name="correo" type="email" placeholder="tu@correo.com" required
                    className="w-full bg-transparent py-3 text-stone-700 font-medium
                               focus:outline-none placeholder:text-stone-300 text-sm" />
                </div>
                <div className="border-b border-stone-200">
                  <textarea
                    name="mensaje" placeholder="Tu mensaje..." rows={4} required
                    className="w-full bg-transparent py-3 text-stone-700 font-medium
                               focus:outline-none placeholder:text-stone-300 resize-none text-sm" />
                </div>
                {/* Feedback */}
                {status === 'ok' && (
                  <div className="bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">
                    ✅ ¡Mensaje enviado! Te respondemos pronto.
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm font-medium">
                    ❌ No se pudo enviar. Intenta de nuevo.
                  </div>
                )}

                <button type="submit" disabled={status === 'sending'}
                  className="w-full bg-stone-900 text-white font-bold text-xs tracking-[0.2em] uppercase
                             py-4 hover:bg-stone-700 active:bg-stone-900 transition-colors
                             touch-manipulation flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send size={14} />
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
