import { useState, useEffect } from "react";
import { useReportes } from "../hooks/useReportes";

export default function ReportesPage() {
  const {
    loading,
    obtenerEstadisticasGenerales,
    obtenerProductosMasVendidos,
    obtenerVentasPorCliente,
  } = useReportes();

  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [estadisticas, setEstadisticas] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasPorCliente, setVentasPorCliente] = useState([]);

  const cargarReportes = async () => {
    try {
      const [stats, productos, clientes] = await Promise.all([
        obtenerEstadisticasGenerales(fechaInicio, fechaFin),
        obtenerProductosMasVendidos(fechaInicio, fechaFin),
        obtenerVentasPorCliente(fechaInicio, fechaFin),
      ]);
      setEstadisticas(stats);
      setProductosMasVendidos(productos);
      setVentasPorCliente(clientes);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
      alert("Error al cargar los reportes");
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const handleGenerarReporte = () => {
    cargarReportes();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">Reportes</h1>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerarReporte}
              disabled={loading}
              className="w-full bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] disabled:bg-gray-300"
            >
              {loading ? "Cargando..." : "Generar Reporte"}
            </button>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS GENERALES */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500 mb-2">Total Ventas</h3>
            <p className="text-2xl font-semibold text-green-600">
              ${estadisticas.totalVentas?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {estadisticas.cantidadVentas} venta(s)
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500 mb-2">Total Compras</h3>
            <p className="text-2xl font-semibold text-red-600">
              ${estadisticas.totalCompras?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {estadisticas.cantidadCompras} compra(s)
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500 mb-2">Utilidad</h3>
            <p className={`text-2xl font-semibold ${estadisticas.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${estadisticas.utilidad?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Margen: {estadisticas.margenGanancia}%
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500 mb-2">Margen de Ganancia</h3>
            <p className="text-2xl font-semibold text-blue-600">
              {estadisticas.margenGanancia}%
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-[#2B3E3C] text-white p-4">
            <h2 className="text-lg font-semibold">Productos Más Vendidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-left">Cantidad</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  productosMasVendidos.map((producto) => (
                    <tr key={producto.idProducto} className="border-b hover:bg-gray-50">
                      <td className="p-2">{producto.nombreProducto}</td>
                      <td className="p-2">{producto.cantidad}</td>
                      <td className="p-2 font-semibold">
                        ${producto.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* VENTAS POR CLIENTE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-[#2B3E3C] text-white p-4">
            <h2 className="text-lg font-semibold">Ventas por Cliente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Cliente</th>
                  <th className="p-2 text-left">Ventas</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorCliente.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  ventasPorCliente.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{item.cliente?.nombreCliente || "-"}</td>
                      <td className="p-2">{item.cantidadVentas}</td>
                      <td className="p-2 font-semibold">
                        ${item.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

