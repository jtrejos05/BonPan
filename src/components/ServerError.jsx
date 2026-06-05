export default function ServerError({ message }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔌</div>
      <h2 className="text-2xl font-black text-red-900 mb-2">Backend no disponible</h2>
      <p className="text-stone-500 mb-6">{message}</p>
      <div className="bg-stone-50 rounded-2xl p-5 text-left text-sm text-stone-600 font-mono">
        <p className="font-bold text-stone-700 mb-2">Para iniciar el servidor:</p>
        <p>cd server</p>
        <p>npm run dev</p>
      </div>
    </div>
  )
}
