import { useState, useEffect } from "react";

export default function PermisoForm({ initialData, onSubmit, onCancel }) {
  const [nombrePermiso, setNombrePermiso] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombrePermiso(initialData.nombrePermiso || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombrePermiso,
      estadoPermiso: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre del Permiso</label>
        <input
          type="text"
          value={nombrePermiso}
          onChange={(e) => setNombrePermiso(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
          placeholder="Ej: crear_productos, editar_ventas, etc."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f]"
        >
          {initialData ? "Actualizar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}

