import { useState } from "react";
import { useOrganizacionPlanes, useHistorialPlanes } from "../hooks/usePlanes";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { useToast } from "../../../components/ToastContainer";
import { usePermissions } from "../../../hooks/usePermissions";
import HistorialPlanModal from "../components/HistorialPlanModal";

function MiPlanPageContent() {
  const { organizacion, organizacionVista } = useOrganizacion();
  const { tieneRol, loading: permissionsLoading } = usePermissions();
  const { planActivo, loading, error } = useOrganizacionPlanes(
    (organizacionVista || organizacion)?.idOrganizacion
  );
  const { historial, loading: loadingHistorial } = useHistorialPlanes(
    (organizacionVista || organizacion)?.idOrganizacion
  );
  const { success, error: showError } = useToast();
  const [showHistorial, setShowHistorial] = useState(false);

  const organizacionActiva = organizacionVista || organizacion;
  const esAdministrador = tieneRol("ADMINISTRADOR");

  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-500">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!esAdministrador) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
          <p className="text-red-600">
            Solo los administradores de la organización pueden ver esta información.
          </p>
        </div>
      </div>
    );
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatearPrecio = (precio) => {
    if (!precio) return "-";
    return `$${parseFloat(precio).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-500">Cargando información del plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Mi Plan de Suscripción
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Información del plan actual de {organizacionActiva?.nombreOrganizacion}
        </p>
      </div>

      {!planActivo ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            No hay un plan activo asignado a esta organización.
          </p>
          <p className="text-yellow-600 text-sm mt-2">
            Contacta con el administrador del sistema para asignar un plan.
          </p>
        </div>
      ) : (
        <>
          {/* TARJETA DEL PLAN ACTUAL */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-[#2B3E3C]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {planActivo.plan?.nombrePlan || "Plan sin nombre"}
                </h2>
                {planActivo.plan?.descripcionPlan && (
                  <p className="text-gray-600 text-sm mb-4">
                    {planActivo.plan.descripcionPlan}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  planActivo.estado === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {planActivo.estado || "inactivo"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Precio
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatearPrecio(planActivo.precioContratado)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Período
                </p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {planActivo.periodo || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Renovación Automática
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {planActivo.renovacionAutomatica ? "✅ Activada" : "❌ Desactivada"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Fecha de Inicio
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {formatearFecha(planActivo.fechaInicio)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Fecha de Fin
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {planActivo.fechaFin ? formatearFecha(planActivo.fechaFin) : "Sin fecha de fin"}
                </p>
              </div>
            </div>

            {/* LÍMITES DEL PLAN */}
            {planActivo.limites && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Límites del Plan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {planActivo.limites.maxUsuarios !== null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Máximo Usuarios
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {planActivo.limites.maxUsuarios || "Ilimitado"}
                      </p>
                    </div>
                  )}
                  {planActivo.limites.maxProductos !== null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Máximo Productos
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {planActivo.limites.maxProductos || "Ilimitado"}
                      </p>
                    </div>
                  )}
                  {planActivo.limites.maxProveedores !== null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Máximo Proveedores
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {planActivo.limites.maxProveedores || "Ilimitado"}
                      </p>
                    </div>
                  )}
                  {planActivo.limites.maxAlmacenes !== null && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Máximo Almacenes
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {planActivo.limites.maxAlmacenes || "Ilimitado"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOTÓN VER HISTORIAL */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowHistorial(true)}
                className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors"
              >
                📜 Ver Historial de Planes
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL HISTORIAL */}
      {showHistorial && organizacionActiva && (
        <HistorialPlanModal
          organizacion={organizacionActiva}
          onClose={() => setShowHistorial(false)}
        />
      )}
    </div>
  );
}

export default function MiPlanPage() {
  return <MiPlanPageContent />;
}

