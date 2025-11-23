import { useState, useEffect } from "react";
import { usePlanes } from "../../planes/hooks/usePlanes";

export default function OrganizacionForm({ initialData, onSubmit, onCancel }) {
  const { planes, loading: planesLoading } = usePlanes();
  const [nombreOrganizacion, setNombreOrganizacion] = useState("");
  const [telefonoOrganizacion, setTelefonoOrganizacion] = useState("");
  const [direccionOrganizacion, setDireccionOrganizacion] = useState("");
  const [codigoOrganizacion, setCodigoOrganizacion] = useState("");
  const [planId, setPlanId] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombreOrganizacion(initialData.nombreOrganizacion || "");
      setTelefonoOrganizacion(initialData.telefonoOrganizacion || "");
      setDireccionOrganizacion(initialData.direccionOrganizacion || "");
      setCodigoOrganizacion(initialData.codigoOrganizacion || "");
      setPlanId(initialData.planId || "");
    } else if (planes.length > 0 && !planId) {
      // Establecer el primer plan como predeterminado
      setPlanId(planes[0].idPlan);
    }
  }, [initialData, planes, planId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombreOrganizacion: nombreOrganizacion.trim(),
      telefonoOrganizacion: telefonoOrganizacion.trim() || null,
      direccionOrganizacion: direccionOrganizacion.trim() || null,
      codigoOrganizacion: codigoOrganizacion.trim() || null,
      planId: planId ? parseInt(planId) : null,
      estadoOrganizacion: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Organización <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombreOrganizacion}
          onChange={(e) => setNombreOrganizacion(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Mi Empresa S.A."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={telefonoOrganizacion}
          onChange={(e) => setTelefonoOrganizacion(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="+1234567890"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <textarea
          value={direccionOrganizacion}
          onChange={(e) => setDireccionOrganizacion(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Dirección de la empresa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan <span className="text-red-500">*</span>
        </label>
        {planesLoading ? (
          <p className="text-sm text-gray-500">Cargando planes...</p>
        ) : (
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          >
            <option value="">Seleccionar plan</option>
            {planes.map((plan) => (
              <option key={plan.idPlan} value={plan.idPlan}>
                {plan.nombrePlan} - ${plan.precioPlan}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código de Organización
        </label>
        <input
          type="text"
          value={codigoOrganizacion}
          onChange={(e) => setCodigoOrganizacion(e.target.value.toUpperCase())}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="MIEMPRESA"
        />
        <p className="text-xs text-gray-500 mt-1">
          Este código permitirá que otros usuarios se unan a la organización
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors"
        >
          {initialData ? "Actualizar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}

