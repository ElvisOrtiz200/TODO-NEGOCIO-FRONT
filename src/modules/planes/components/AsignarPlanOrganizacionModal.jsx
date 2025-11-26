import { useState, useEffect } from "react";
import { usePlanes } from "../hooks/usePlanes";
import { useOrganizaciones } from "../../organizaciones/hooks/useOrganizaciones";
import { useToast } from "../../../components/ToastContainer";
import * as planService from "../services/planService";

export default function AsignarPlanOrganizacionModal({ organizacion: organizacionProp, onClose, onSuccess }) {
  const { planes, loading: loadingPlanes } = usePlanes(true);
  const { organizaciones, loading: loadingOrganizaciones } = useOrganizaciones();
  const { success, error: showError } = useToast();
  
  const [organizacionId, setOrganizacionId] = useState(organizacionProp?.idOrganizacion || "");
  const [planId, setPlanId] = useState("");
  const [periodo, setPeriodo] = useState("mensual");
  const [renovacionAutomatica, setRenovacionAutomatica] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [precioContratado, setPrecioContratado] = useState("");
  const [metadata, setMetadata] = useState("");
  const [loadingAsignar, setLoadingAsignar] = useState(false);

  useEffect(() => {
    if (planId) {
      const planSeleccionado = planes.find(p => p.idPlan === parseInt(planId));
      if (planSeleccionado && !precioContratado) {
        setPrecioContratado(planSeleccionado.precioPlan);
      }
    }
  }, [planId, planes, precioContratado]);

  useEffect(() => {
    // Establecer fecha de inicio por defecto
    if (!fechaInicio) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      setFechaInicio(hoy.toISOString().split('T')[0]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!organizacionId) {
      showError("Debes seleccionar una organización");
      return;
    }

    if (!planId) {
      showError("Debes seleccionar un plan");
      return;
    }

    let metadataObj = null;
    if (metadata.trim()) {
      try {
        metadataObj = JSON.parse(metadata);
      } catch (err) {
        showError("El metadata debe ser un JSON válido");
        return;
      }
    }

    setLoadingAsignar(true);
    try {
      const organizacionPlan = {
        organizacionId,
        planId: parseInt(planId),
        periodo,
        renovacionAutomatica,
        fechaInicio: fechaInicio ? new Date(fechaInicio).toISOString() : new Date().toISOString(),
        fechaFin: fechaFin ? new Date(fechaFin).toISOString() : null,
        precioContratado: precioContratado ? parseFloat(precioContratado) : null,
        metadata: metadataObj
      };

      const data = await planService.asignarPlanOrganizacion(organizacionPlan);
      
      success("Plan asignado exitosamente");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error asignando plan:", err);
      showError(err.message || "Error al asignar el plan");
    } finally {
      setLoadingAsignar(false);
    }
  };

  const organizacionSeleccionada = organizaciones.find(o => o.idOrganizacion === organizacionId);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Asignar Plan a Organización
          </h2>
          <p className="text-gray-600 text-sm">
            Selecciona una organización y un plan, luego configura los detalles de la suscripción
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organización <span className="text-red-500">*</span>
              </label>
              {loadingOrganizaciones ? (
                <div className="text-sm text-gray-500">Cargando organizaciones...</div>
              ) : (
                <select
                  value={organizacionId}
                  onChange={(e) => setOrganizacionId(e.target.value)}
                  required
                  disabled={!!organizacionProp}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Selecciona una organización</option>
                  {organizaciones.map((org) => (
                    <option key={org.idOrganizacion} value={org.idOrganizacion}>
                      {org.nombreOrganizacion}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan <span className="text-red-500">*</span>
              </label>
              {loadingPlanes ? (
                <div className="text-sm text-gray-500">Cargando planes...</div>
              ) : (
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="">Selecciona un plan</option>
                  {planes.map((plan) => (
                    <option key={plan.idPlan} value={plan.idPlan}>
                      {plan.nombrePlan} - ${parseFloat(plan.precioPlan).toFixed(2)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período <span className="text-red-500">*</span>
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Contratado
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioContratado}
                  onChange={(e) => setPrecioContratado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                  placeholder="Precio del plan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={renovacionAutomatica}
                  onChange={(e) => setRenovacionAutomatica(e.target.checked)}
                  className="w-4 h-4 text-[#2B3E3C] border-gray-300 rounded focus:ring-[#2B3E3C]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Renovación Automática
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metadata (JSON)
              </label>
              <textarea
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent font-mono text-sm"
                placeholder='{"notas": "Plan especial", "descuento": 10}'
              />
              <p className="text-xs text-gray-500 mt-1">
                Información adicional en formato JSON (opcional)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingAsignar}
              className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors disabled:opacity-50"
            >
              {loadingAsignar ? "Asignando..." : "Asignar Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

