export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Acceso No Autorizado</h2>
        <p className="text-gray-300 mb-8">
          No tienes permisos para acceder a esta página.
        </p>
        <a
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
}
