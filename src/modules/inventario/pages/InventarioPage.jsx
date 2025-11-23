import { useInventario } from "../hooks/useInventario";

export default function InventarioPage() {
  const { inventario, productosBajoStock, loading } = useInventario();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Control de Inventario
        </h1>
      </div>

      {/* ALERTAS DE STOCK BAJO */}
      {productosBajoStock.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Advertencia:</strong> {productosBajoStock.length} producto(s) con stock bajo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE INVENTARIO */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-500">Cargando inventario...</p>
        ) : inventario.length === 0 ? (
          <p className="p-4 text-gray-500">No hay productos en inventario.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2B3E3C] text-white">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Categoría</th>
                  <th className="p-2 text-left">Almacén</th>
                  <th className="p-2 text-left">Stock Actual</th>
                  <th className="p-2 text-left">Stock Mínimo</th>
                  <th className="p-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((producto) => {
                  const stockBajo = producto.stockActual <= producto.stockMinimo;
                  return (
                    <tr
                      key={producto.idProducto}
                      className={`border-b hover:bg-gray-50 ${
                        stockBajo ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="p-2">{producto.idProducto}</td>
                      <td className="p-2">{producto.nombreProducto}</td>
                      <td className="p-2">
                        {producto.categoria?.nombreCategoria || "-"}
                      </td>
                      <td className="p-2">
                        {producto.almacen?.nombreAlmacen || "-"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            stockBajo
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {producto.stockActual || 0}
                        </span>
                      </td>
                      <td className="p-2">{producto.stockMinimo || 0}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            producto.estadoProducto
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {producto.estadoProducto ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

