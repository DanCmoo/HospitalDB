export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <main className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Sistema de Gestión Hospitalaria
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Plataforma integral para la gestión de pacientes, citas y recursos hospitalarios
        </p>
        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al Dashboard
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-gray-800 text-blue-400 border-2 border-blue-500 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </main>
    </div>
  );
}
