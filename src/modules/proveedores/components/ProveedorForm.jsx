import { useState, useEffect } from "react";

export default function ProveedorForm({ initialData, onSubmit, onCancel }) {
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [telefonoProveedor, setTelefonoProveedor] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombreProveedor(initialData.nombreProveedor);
      setTelefonoProveedor(initialData.telefonoProveedor);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombreProveedor,
      telefonoProveedor,
      estadoProveedor: true, // por defecto activo
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre del Proveedor</label>
        <input
          type="text"
          value={nombreProveedor}
          onChange={(e) => setNombreProveedor(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Teléfono</label>
        <input
          type="text"
          value={telefonoProveedor}
          onChange={(e) => setTelefonoProveedor(e.target.value)}
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
