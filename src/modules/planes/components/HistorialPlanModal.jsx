import { useHistorialPlanes } from "../hooks/usePlanes";

export default function HistorialPlanModal({ organizacion, onClose }) {
  const { historial, loading, error } = useHistorialPlanes(organizacion?.idOrganizacion);

  const getAccionColor = (accion) => {
    switch (accion?.toLowerCase()) {
      case "asignacion":
        return "bg-green-100 text-green-700";
      case "actualizacion":
        return "bg-blue-100 text-blue-700";
      case "cancelacion":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!organizacion) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Historial de Planes: {organizacion.nombreOrganizacion}
          </h2>
          <p className="text-gray-600 text-sm">
            Registro de todas las acciones relacionadas con los planes
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
              <p className="mt-4 text-gray-500">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay historial registrado para esta organización
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((item) => (
                <div
                  key={item.idHistorial}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getAccionColor(
                            item.accion
                          )}`}
                        >
                          {item.accion || "Sin acción"}
                        </span>
                        {item.plan && (
                          <span className="text-sm font-medium text-gray-800">
                            Plan: {item.plan.nombrePlan}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.detalle || "-"}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>💰 ${parseFloat(item.precio || 0).toFixed(2)}</span>
                        <span>📅 {formatearFecha(item.fechaAccion)}</span>
                        {item.usuarioId && <span>👤 Usuario ID: {item.usuarioId}</span>}
                      </div>
                    </div>
                  </div>
                  {item.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Ver metadata
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(item.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

