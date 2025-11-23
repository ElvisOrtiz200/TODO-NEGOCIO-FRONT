import { useState } from "react";
import { useVentas } from "../hooks/useVentas";
import VentaForm from "../components/VentaForm";
import { useProductos } from "../../productos/hooks/useProductos";

export default function VentasPage() {
  const { ventas, loading, addVenta, removeVenta, loadVentas } = useVentas();
  const { loadProductos } = useProductos();
  const [showForm, setShowForm] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);

  const handleSubmit = async (venta, detalles) => {
    try {
      await addVenta(venta, detalles);
      // Actualizar stock de productos
      await loadProductos();
      await loadVentas();
      setShowForm(false);
      setSelectedVenta(null);
      alert("Venta registrada exitosamente");
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      alert("Error al registrar la venta");
    }
  };

  const handleViewDetalles = async (venta) => {
    // Aquí podrías abrir un modal o navegar a una página de detalles
    setSelectedVenta(venta);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Gestión de Ventas
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedVenta(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nueva Venta
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <VentaForm
            initialData={selectedVenta}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedVenta(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE VENTAS */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando ventas...</p>
          ) : ventas.length === 0 ? (
            <p className="p-4 text-gray-500">No hay ventas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Cliente</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.idVenta} className="border-b hover:bg-gray-50">
                      <td className="p-2">{v.idVenta}</td>
                      <td className="p-2">
                        {new Date(v.fechaVenta).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {v.cliente?.nombreCliente || "Venta General"}
                      </td>
                      <td className="p-2 font-semibold">
                        ${v.totalVenta?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            v.estadoVenta === "COMPLETADA"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {v.estadoVenta}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-3">
                        <button
                          onClick={() => handleViewDetalles(v)}
                          className="text-blue-500 hover:underline"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("¿Está seguro de eliminar esta venta?")) {
                              removeVenta(v.idVenta);
                            }
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {selectedVenta && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Detalles de Venta #{selectedVenta.idVenta}</h2>
            {/* Aquí mostrarías los detalles de la venta */}
            <button
              onClick={() => setSelectedVenta(null)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

