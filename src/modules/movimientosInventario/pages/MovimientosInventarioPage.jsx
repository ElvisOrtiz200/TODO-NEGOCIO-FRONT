import { useState } from "react";
import { useMovimientosInventario } from "../hooks/useMovimientosInventario";
import MovimientoInventarioForm from "../components/MovimientoInventarioForm";
import { useInventario } from "../../inventario/hooks/useInventario";

export default function MovimientosInventarioPage() {
  const { movimientos, loading, addMovimiento, loadMovimientos } = useMovimientosInventario();
  const { loadInventario } = useInventario();
  const [showForm, setShowForm] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);

  const handleSubmit = async (movimiento) => {
    try {
      await addMovimiento(movimiento);
      await loadInventario();
      await loadMovimientos();
      setShowForm(false);
      setSelectedMovimiento(null);
      alert("Movimiento registrado exitosamente");
    } catch (error) {
      console.error("Error al guardar el movimiento:", error);
      alert("Error al registrar el movimiento. Verifique que el stock sea suficiente para salidas.");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Movimientos de Inventario
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedMovimiento(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nuevo Movimiento
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <MovimientoInventarioForm
            initialData={selectedMovimiento}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedMovimiento(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE MOVIMIENTOS */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando movimientos...</p>
          ) : movimientos.length === 0 ? (
            <p className="p-4 text-gray-500">No hay movimientos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Naturaleza</th>
                    <th className="p-2 text-left">Cantidad</th>
                    <th className="p-2 text-left">Stock Anterior</th>
                    <th className="p-2 text-left">Stock Nuevo</th>
                    <th className="p-2 text-left">Almacén</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => (
                    <tr key={mov.idMovimientoInventario} className="border-b hover:bg-gray-50">
                      <td className="p-2">{mov.idMovimientoInventario}</td>
                      <td className="p-2">
                        {new Date(mov.fechaMovimiento).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {mov.producto?.nombreProducto || "-"}
                      </td>
                      <td className="p-2">
                        {mov.tipoMovimiento?.descripcionMovimiento || "-"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            mov.tipoMovimiento?.naturaleza === "Entrada"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {mov.tipoMovimiento?.naturaleza || "-"}
                        </span>
                      </td>
                      <td className="p-2">{mov.cantidad}</td>
                      <td className="p-2">{mov.stockAnterior || "-"}</td>
                      <td className="p-2 font-semibold">{mov.stockNuevo || "-"}</td>
                      <td className="p-2">
                        {mov.almacen?.nombreAlmacen || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

