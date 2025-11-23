import { useState, useEffect } from "react";

export default function RolForm({ initialData, onSubmit, onCancel }) {
  const [nombreRol, setNombreRol] = useState("");
  const [descripcionRol, setDescripcionRol] = useState("");
 

  useEffect(() => {
    if (initialData) {
      setNombreRol(initialData.nombreRol);
      setDescripcionRol(initialData.descripcionRol);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rolData = {
      nombreRol: nombreRol.trim(),
      descripcionRol: descripcionRol ? descripcionRol.trim() : null,
      estadoRol: true,
    };
    
    // Solo agregar fechaRegistroRol si es un nuevo rol
    if (!initialData) {
      rolData.fechaRegistroRol = new Date().toISOString();
    }
    
    onSubmit(rolData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Rol <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombreRol}
          onChange={(e) => setNombreRol(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Ej: Administrador, Vendedor, etc."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del Rol
        </label>
        <textarea
          value={descripcionRol || ""}
          onChange={(e) => setDescripcionRol(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Descripción del rol y sus responsabilidades"
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
