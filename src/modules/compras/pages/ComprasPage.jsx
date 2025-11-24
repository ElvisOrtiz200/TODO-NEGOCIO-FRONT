import { useState } from "react";
import { useCompras } from "../hooks/useCompras";
import CompraForm from "../components/CompraForm";
import { useProductos } from "../../productos/hooks/useProductos";
import { useToast } from "../../../components/ToastContainer";

export default function ComprasPage() {
  const { compras, loading, addCompra, removeCompra, loadCompras } = useCompras();
  const { loadProductos } = useProductos();
  const { success, error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);

  const handleSubmit = async (compra, detalles) => {
    try {
      await addCompra(compra, detalles);
      // Actualizar stock de productos
      await loadProductos();
      await loadCompras();
      setShowForm(false);
      setSelectedCompra(null);
      success("Compra registrada exitosamente");
    } catch (error) {
      console.error("Error al guardar la compra:", error);
      showError("Error al registrar la compra");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Gestión de Compras
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedCompra(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nueva Compra
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <CompraForm
            initialData={selectedCompra}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedCompra(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE COMPRAS */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando compras...</p>
          ) : compras.length === 0 ? (
            <p className="p-4 text-gray-500">No hay compras registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Proveedor</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((c) => (
                    <tr key={c.idCompra} className="border-b hover:bg-gray-50">
                      <td className="p-2">{c.idCompra}</td>
                      <td className="p-2">
                        {new Date(c.fechaCompra).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {c.proveedor?.nombreProveedor || "-"}
                      </td>
                      <td className="p-2 font-semibold">
                        ${c.totalCompra?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            c.estadoCompra === "COMPLETADA"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {c.estadoCompra}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-3">
                        <button
                          onClick={() => {
                            if (confirm("¿Está seguro de eliminar esta compra?")) {
                              removeCompra(c.idCompra);
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
    </div>
  );
}

