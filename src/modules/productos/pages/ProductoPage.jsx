import { useState } from "react";
import { useProductos } from "../hooks/useProductos";
import ProductoForm from "../components/ProductoForm";
import PermisoGuard from "../../../components/PermisoGuard";
import { usePermissions } from "../../../hooks/usePermissions";

export default function ProductoPage() {
  const { productos, loading, addProducto, editProducto, removeProducto } = useProductos();
  const [showForm, setShowForm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const { tienePermiso, isSuperAdmin } = usePermissions();

  const handleSubmit = async (producto) => {
    try {
      if (selectedProducto) {
        await editProducto(selectedProducto.idProducto, producto);
      } else {
        await addProducto(producto);
      }
      setShowForm(false);
      setSelectedProducto(null);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Gestión de Productos
        </h1>
        {!showForm && (
          <PermisoGuard permiso="productos.crear">
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedProducto(null);
              }}
              className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
            >
              + Nuevo Producto
            </button>
          </PermisoGuard>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <ProductoForm
            initialData={selectedProducto}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedProducto(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE PRODUCTOS */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="p-4 text-gray-500">No hay productos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Código</th>
                    <th className="p-2 text-left">Precio Compra</th>
                    <th className="p-2 text-left">Precio Venta</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.idProducto} className="border-b hover:bg-gray-50">
                      <td className="p-2">{p.idProducto}</td>
                      <td className="p-2">{p.nombreProducto}</td>
                      <td className="p-2">{p.codigoBarras || "-"}</td>
                      <td className="p-2">${p.precioCompra?.toFixed(2) || "0.00"}</td>
                      <td className="p-2">${p.precioVenta?.toFixed(2) || "0.00"}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.stockActual <= p.stockMinimo
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {p.stockActual || 0}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.estadoProducto
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.estadoProducto ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-3">
                        <PermisoGuard permiso="productos.editar">
                          <button
                            onClick={() => {
                              setSelectedProducto(p);
                              setShowForm(true);
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            Editar
                          </button>
                        </PermisoGuard>
                        <PermisoGuard permiso="productos.eliminar">
                          <button
                            onClick={() => removeProducto(p.idProducto)}
                            className="text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </PermisoGuard>
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
