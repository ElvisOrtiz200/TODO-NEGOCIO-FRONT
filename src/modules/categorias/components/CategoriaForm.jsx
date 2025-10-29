import { useState, useEffect } from "react";

export default function CategoriaForm({ initialData, onSubmit, onCancel }) {
  const [nombreCategoria, setNombreCategoria] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombreCategoria(initialData.nombreCategoria);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevaCategoria = {
      nombreCategoria,
      estadoCategoria: true,
    };

    onSubmit(nuevaCategoria);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre de la Categoría</label>
        <input
          type="text"
          value={nombreCategoria}
          onChange={(e) => setNombreCategoria(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
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
