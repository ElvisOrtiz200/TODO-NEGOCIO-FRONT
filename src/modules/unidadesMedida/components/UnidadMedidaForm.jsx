import { useState, useEffect } from "react";
import { useToast } from "../../../components/ToastContainer";

export default function UnidadMedidaForm({ initialData, onSubmit, onCancel }) {
  const { warning } = useToast();
  const [nombreUnidadMedida, setNombreUnidadMedida] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombreUnidadMedida(initialData.nombreUnidadMedida || "");
    } else {
      setNombreUnidadMedida("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!nombreUnidadMedida.trim()) {
      warning("El nombre de la unidad de medida es obligatorio");
      return;
    }

    const unidadMedidaData = {
      nombreUnidadMedida: nombreUnidadMedida.trim(),
    };

    // Solo agregar fechaRegistroUnidad si es una nueva unidad
    if (!initialData) {
      unidadMedidaData.fechaRegistroUnidad = new Date().toISOString();
    }

    console.log("📤 Enviando datos de la unidad de medida:", unidadMedidaData);
    onSubmit(unidadMedidaData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Unidad de Medida <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombreUnidadMedida}
          onChange={(e) => setNombreUnidadMedida(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Ej: Kilogramo, Litro, Metro, etc."
        />
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

