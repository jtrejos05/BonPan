// Hora actual en Colombia como "HH:MM"
function horaColombia() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date())
}

// true si el local tiene horario configurado y estamos fuera de él
function fueraDeHorario(pv) {
  if (!pv.hora_apertura || !pv.hora_cierre) return false
  const ahora = horaColombia()
  if (pv.hora_apertura <= pv.hora_cierre) {
    return ahora < pv.hora_apertura || ahora > pv.hora_cierre
  }
  // Horario que cruza medianoche (ej: 22:00 → 06:00)
  return ahora < pv.hora_apertura && ahora > pv.hora_cierre
}

module.exports = { horaColombia, fueraDeHorario }
