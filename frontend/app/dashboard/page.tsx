export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard - Sistema Hospitalario
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Pacientes
            </h2>
            <p className="text-gray-600">
              Gestión de información de pacientes
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Citas
            </h2>
            <p className="text-gray-600">
              Administración de agenda médica
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Medicamentos
            </h2>
            <p className="text-gray-600">
              Control de prescripciones y stock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
