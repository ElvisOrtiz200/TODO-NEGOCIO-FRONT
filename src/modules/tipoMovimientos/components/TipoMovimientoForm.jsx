import { useState, useEffect } from "react";

export default function TipoMovimientoForm({ initialData, onSubmit, onCancel }) {
  const [descripcionMovimiento, setDescripcionMovimiento] = useState("");
  const [naturaleza, setNaturaleza] = useState("");

  useEffect(() => {
    if (initialData) {
      setDescripcionMovimiento(initialData.descripcionMovimiento || "");
      setNaturaleza(initialData.naturaleza || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevoTipoMovimiento = {
      descripcionMovimiento,
      naturaleza,
      fechaRegistroMovimiento: new Date().toISOString(),
      estadoTipoMovimiento: true,
    };

    onSubmit(nuevoTipoMovimiento);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Descripción del Movimiento</label>
        <input
          type="text"
          value={descripcionMovimiento}
          onChange={(e) => setDescripcionMovimiento(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Naturaleza</label>
        <select
          value={naturaleza}
          onChange={(e) => setNaturaleza(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        >
          <option value="">Seleccione...</option>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
        </select>
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
