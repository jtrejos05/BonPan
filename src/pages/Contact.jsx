import { MapPin, Phone, Clock, Mail } from 'lucide-react'

function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function FbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export default function Contact() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-red-950 to-red-800 py-16 text-center">
        <p className="text-red-300 font-bold text-sm tracking-widest uppercase mb-3">Encuéntranos</p>
        <h1 className="text-5xl font-black text-white mb-3" style={{fontFamily:'Montserrat,sans-serif'}}>Contáctanos</h1>
        <p className="text-red-200 text-lg">Estamos aquí para atenderte con gusto</p>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Info */}
          <div className="space-y-4">
            {[
              { icon: <MapPin className="text-red-600 shrink-0" size={22} />, title: 'Dirección',
                lines: ['Calle 15 #23-45, Centro', 'Pereira, Risaralda'] },
              { icon: <Phone className="text-red-600 shrink-0" size={22} />, title: 'Teléfono',
                lines: ['+57 310 123 4567', '+57 6 335 6789'] },
              { icon: <Mail className="text-red-600 shrink-0" size={22} />, title: 'Correo',
                lines: ['hola@bonpan.co'] },
              { icon: <Clock className="text-red-600 shrink-0" size={22} />, title: 'Horario',
                lines: ['Lunes – Viernes: 6:00am – 7:00pm', 'Sábado – Domingo: 7:00am – 5:00pm'] },
            ].map(item => (
              <div key={item.title}
                className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex gap-4 hover:shadow-md transition-shadow text-left">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-black text-red-900 mb-1 text-sm"
                      style={{fontFamily:'Montserrat,sans-serif'}}>{item.title}</h3>
                  {item.lines.map(l => <p key={l} className="text-stone-500 text-sm">{l}</p>)}
                </div>
              </div>
            ))}

            {/* Redes sociales */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 text-left">
              <h3 className="font-black text-red-900 mb-4 text-sm" style={{fontFamily:'Montserrat,sans-serif'}}>
                Redes Sociales
              </h3>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/panaderia.bonpan/?hl=es"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                  <IgIcon /> Instagram
                </a>
                <a href="https://www.facebook.com/panaderia.bonpan?locale=es_LA"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  <FbIcon /> Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Mapa + formulario */}
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-100 h-56">
              <iframe title="Ubicación Bon Pan" width="100%" height="100%" style={{border:0}}
                loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=Calle+15+%2323-45,+Centro,+Pereira,+Risaralda,+Colombia&output=embed" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 text-left">
              <h2 className="font-black text-red-900 text-lg mb-5" style={{fontFamily:'Montserrat,sans-serif'}}>
                Envíanos un Mensaje
              </h2>
              <form className="space-y-4"
                onSubmit={e => { e.preventDefault(); alert('¡Mensaje enviado! Te respondemos pronto.') }}>
                <input type="text" placeholder="Tu nombre" required
                  className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                             focus:outline-none focus:border-red-300 font-medium transition-colors" />
                <input type="email" placeholder="tu@correo.com" required
                  className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                             focus:outline-none focus:border-red-300 font-medium transition-colors" />
                <textarea placeholder="Tu mensaje..." rows={4} required
                  className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 text-stone-700
                             focus:outline-none focus:border-red-300 resize-none font-medium transition-colors" />
                <button type="submit"
                  className="w-full bg-red-700 text-white font-black py-3.5 rounded-xl hover:bg-red-800 transition-colors shadow-sm hover:shadow-md">
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
