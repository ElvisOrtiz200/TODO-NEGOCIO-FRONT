import { useState, useEffect } from "react";
import { usePlanLimits } from "../hooks/usePlanes";

export default function PlanForm({ initialData, onSubmit, onCancel, onSaveLimits }) {
  const [nombrePlan, setNombrePlan] = useState("");
  const [descripcionPlan, setDescripcionPlan] = useState("");
  const [precioPlan, setPrecioPlan] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [estadoPlan, setEstadoPlan] = useState(true);
  
  // Límites del plan
  const [maxUsuarios, setMaxUsuarios] = useState("");
  const [maxProductos, setMaxProductos] = useState("");
  const [maxProveedores, setMaxProveedores] = useState("");
  const [maxAlmacenes, setMaxAlmacenes] = useState("");
  const [caracteristicasExtra, setCaracteristicasExtra] = useState("");

  const { limits, loading: loadingLimits, saveLimits } = usePlanLimits(initialData?.idPlan);

  useEffect(() => {
    if (initialData) {
      setNombrePlan(initialData.nombrePlan || "");
      setDescripcionPlan(initialData.descripcionPlan || "");
      setPrecioPlan(initialData.precioPlan || "");
      setEstadoPlan(initialData.estadoPlan !== undefined ? initialData.estadoPlan : true);
      setCaracteristicas(
        initialData.caracteristicas
          ? JSON.stringify(initialData.caracteristicas, null, 2)
          : ""
      );
    }
  }, [initialData]);

  useEffect(() => {
    if (limits) {
      setMaxUsuarios(limits.maxUsuarios || "");
      setMaxProductos(limits.maxProductos || "");
      setMaxProveedores(limits.maxProveedores || "");
      setMaxAlmacenes(limits.maxAlmacenes || "");
      setCaracteristicasExtra(
        limits.caracteristicas_extra
          ? JSON.stringify(limits.caracteristicas_extra, null, 2)
          : ""
      );
    }
  }, [limits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let caracteristicasObj = null;
    if (caracteristicas.trim()) {
      try {
        caracteristicasObj = JSON.parse(caracteristicas);
      } catch (err) {
        alert("Las características deben ser un JSON válido");
        return;
      }
    }

    const planData = {
      nombrePlan: nombrePlan.trim(),
      descripcionPlan: descripcionPlan.trim() || null,
      precioPlan: parseFloat(precioPlan) || 0,
      caracteristicas: caracteristicasObj,
      estadoPlan: estadoPlan,
    };
    
    if (!initialData) {
      planData.fechaCreacion = new Date().toISOString();
    }
    
    const result = await onSubmit(planData);
    
    // Si el plan se guardó exitosamente y hay un ID, guardar los límites
    if (result?.success && (initialData?.idPlan || result?.data?.idPlan)) {
      const planId = initialData?.idPlan || result?.data?.idPlan;
      
      let caracteristicasExtraObj = null;
      if (caracteristicasExtra.trim()) {
        try {
          caracteristicasExtraObj = JSON.parse(caracteristicasExtra);
        } catch (err) {
          alert("Las características extra deben ser un JSON válido");
          return;
        }
      }

      const limitsData = {
        maxUsuarios: maxUsuarios ? parseInt(maxUsuarios) : null,
        maxProductos: maxProductos ? parseInt(maxProductos) : null,
        maxProveedores: maxProveedores ? parseInt(maxProveedores) : null,
        maxAlmacenes: maxAlmacenes ? parseInt(maxAlmacenes) : null,
        caracteristicas_extra: caracteristicasExtraObj
      };

      if (onSaveLimits) {
        await onSaveLimits(planId, limitsData);
      } else {
        await saveLimits(limitsData);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombrePlan}
          onChange={(e) => setNombrePlan(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Ej: Básico, Profesional, Enterprise"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={descripcionPlan}
          onChange={(e) => setDescripcionPlan(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Descripción del plan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precio <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={precioPlan}
          onChange={(e) => setPrecioPlan(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado del Plan
        </label>
        <select
          value={estadoPlan}
          onChange={(e) => setEstadoPlan(e.target.value === "true")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
        >
          <option value={true}>Activo</option>
          <option value={false}>Inactivo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Características (JSON)
        </label>
        <textarea
          value={caracteristicas}
          onChange={(e) => setCaracteristicas(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent font-mono text-sm"
          placeholder='{"almacenamiento": "10GB", "usuarios": 5, "soporte": "email"}'
        />
        <p className="text-xs text-gray-500 mt-1">
          Formato JSON válido. Ejemplo: {"{"}"almacenamiento": "10GB", "usuarios": 5{"}"}
        </p>
      </div>

      {/* Límites del Plan */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Límites del Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Usuarios
            </label>
            <input
              type="number"
              min="0"
              value={maxUsuarios}
              onChange={(e) => setMaxUsuarios(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              placeholder="Sin límite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Productos
            </label>
            <input
              type="number"
              min="0"
              value={maxProductos}
              onChange={(e) => setMaxProductos(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              placeholder="Sin límite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Proveedores
            </label>
            <input
              type="number"
              min="0"
              value={maxProveedores}
              onChange={(e) => setMaxProveedores(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              placeholder="Sin límite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Almacenes
            </label>
            <input
              type="number"
              min="0"
              value={maxAlmacenes}
              onChange={(e) => setMaxAlmacenes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              placeholder="Sin límite"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Características Extra (JSON)
          </label>
          <textarea
            value={caracteristicasExtra}
            onChange={(e) => setCaracteristicasExtra(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent font-mono text-sm"
            placeholder='{"soporte": "24/7", "backup": "diario"}'
          />
          <p className="text-xs text-gray-500 mt-1">
            Características adicionales en formato JSON
          </p>
        </div>
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

