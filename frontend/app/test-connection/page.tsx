'use client';

import { useEffect, useState } from 'react';
import { healthApi, HealthCheckResponse, DatabaseHealthResponse } from '@/lib/api/health';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function TestConnectionPage() {
  const [apiHealth, setApiHealth] = useState<HealthCheckResponse | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const [apiResponse, dbResponse] = await Promise.all([
        healthApi.check(),
        healthApi.checkDatabase(),
      ]);

      setApiHealth(apiResponse);
      setDbHealth(dbResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Test Backend Connection
          </h1>
          <p className="mt-2 text-gray-600">
            Verify the connection between frontend and backend
          </p>
        </div>

        {loading && <LoadingSpinner size="lg" message="Checking connection..." />}

        {error && (
          <ErrorMessage message={error} onRetry={checkConnection} />
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* API Health */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  API Status
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    apiHealth?.status === 'ok'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {apiHealth?.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="text-gray-900">{apiHealth?.message}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="text-gray-900">{apiHealth?.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="text-gray-900">{apiHealth?.environment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="text-gray-900">{apiHealth?.uptime}</p>
                </div>
              </div>
            </div>

            {/* Database Health */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Database Status
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dbHealth?.status === 'ok'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {dbHealth?.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="text-gray-900">{dbHealth?.message}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Database</p>
                  <p className="text-gray-900">{dbHealth?.database}</p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={checkConnection}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
