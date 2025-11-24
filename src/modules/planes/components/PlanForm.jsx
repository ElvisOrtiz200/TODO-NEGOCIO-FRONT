import { useState, useEffect } from "react";

export default function PlanForm({ initialData, onSubmit, onCancel }) {
  const [nombrePlan, setNombrePlan] = useState("");
  const [descripcionPlan, setDescripcionPlan] = useState("");
  const [precioPlan, setPrecioPlan] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombrePlan(initialData.nombrePlan || "");
      setDescripcionPlan(initialData.descripcionPlan || "");
      setPrecioPlan(initialData.precioPlan || "");
      setCaracteristicas(
        initialData.caracteristicas
          ? JSON.stringify(initialData.caracteristicas, null, 2)
          : ""
      );
    }
  }, [initialData]);

  const handleSubmit = (e) => {
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
      estadoPlan: true,
    };
    
    if (!initialData) {
      planData.fechaCreacion = new Date().toISOString();
    }
    
    onSubmit(planData);
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

