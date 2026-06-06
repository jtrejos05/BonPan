import { MapPin, Phone, Clock, Mail } from 'lucide-react'

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
  { icon: <MapPin size={18} />, title: 'Dirección', lines: ['Calle 15 #23-45, Centro', 'Ibagué, Tolima'] },
  { icon: <Phone size={18} />, title: 'Teléfono', lines: ['+57 310 123 4567', '+57 6 335 6789'] },
  { icon: <Mail size={18} />, title: 'Correo', lines: ['hola@bonpan.co'] },
  { icon: <Clock size={18} />, title: 'Horario', lines: ['Lunes – Viernes: 6:00am – 7:00pm', 'Sábado – Domingo: 7:00am – 5:00pm'] },
]

export default function Contact() {
  return (
    <div className="bg-[#faf7f2]">
      {/* Header */}
      <div className="bg-red-950 pt-20 pb-0 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative z-10 pb-16">
          <p className="text-red-400 text-xs tracking-[0.4em] uppercase font-semibold mb-4">Visítanos</p>
          <h1 className="text-6xl text-white mb-4" style={{fontFamily:'Playfair Display, serif'}}>Contáctanos</h1>
          <p className="text-red-200/70 font-light text-lg">Estamos aquí para atenderte con gusto</p>
        </div>
        <svg viewBox="0 0 1440 60" className="w-full block" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#faf7f2" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Info */}
          <div className="space-y-0">
            {INFO.map((item, i) => (
              <div key={item.title}
                className={`flex gap-5 py-6 ${i < INFO.length - 1 ? 'border-b border-stone-200' : ''}`}>
                <div className="w-10 h-10 bg-red-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-1">{item.title}</p>
                  {item.lines.map(l => (
                    <p key={l} className="text-stone-700 font-medium">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Redes */}
            <div className="pt-6 text-left">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 mb-4">Redes Sociales</p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/panaderia.bonpan/?hl=es"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-stone-300 text-stone-700 px-5 py-2.5
                             text-xs font-bold tracking-widest uppercase hover:bg-stone-900 hover:text-white
                             hover:border-stone-900 transition-all duration-300">
                  <IgIcon /> Instagram
                </a>
                <a href="https://www.facebook.com/panaderia.bonpan?locale=es_LA"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-stone-300 text-stone-700 px-5 py-2.5
                             text-xs font-bold tracking-widest uppercase hover:bg-blue-700 hover:text-white
                             hover:border-blue-700 transition-all duration-300">
                  <FbIcon /> Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Mapa + Formulario */}
          <div className="space-y-6">
            <div className="overflow-hidden h-52 border border-stone-200">
              <iframe title="Ubicación Bon Pan" width="100%" height="100%" style={{border:0}}
                loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Ibagu%C3%A9,+Tolima,+Colombia&output=embed" />
            </div>

            <div className="bg-white border border-stone-200 p-8 text-left">
              <h2 className="text-2xl text-red-950 mb-6" style={{fontFamily:'Playfair Display, serif'}}>
                Envíanos un Mensaje
              </h2>
              <form className="space-y-5"
                onSubmit={e => { e.preventDefault(); alert('¡Mensaje enviado! Te respondemos pronto.') }}>
                {[
                  {type:'text', placeholder:'Tu nombre completo'},
                  {type:'email', placeholder:'tu@correo.com'},
                ].map(f => (
                  <div key={f.placeholder} className="border-b border-stone-200 pb-1">
                    <input {...f} required
                      className="w-full bg-transparent py-2 text-stone-700 font-medium
                                 focus:outline-none placeholder:text-stone-300 text-sm" />
                  </div>
                ))}
                <div className="border-b border-stone-200 pb-1">
                  <textarea placeholder="Tu mensaje..." rows={4} required
                    className="w-full bg-transparent py-2 text-stone-700 font-medium
                               focus:outline-none placeholder:text-stone-300 resize-none text-sm" />
                </div>
                <button type="submit"
                  className="w-full bg-red-950 text-white font-bold text-xs tracking-widest uppercase
                             py-4 hover:bg-red-900 transition-colors">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
