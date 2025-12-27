import { useState, useMemo } from "react";
import { useProductos } from "../hooks/useProductos";
import ProductoForm from "../components/ProductoForm";
import PermisoGuard from "../../../components/PermisoGuard";
import { usePermissions } from "../../../hooks/usePermissions";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { useToast } from "../../../components/ToastContainer";

export default function ProductoPage() {
  const { productos, loading, addProducto, editProducto, removeProducto, loadProductos } = useProductos();
  const { success, error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const { tienePermiso, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const { organizacionVista } = useOrganizacion();
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroTipoProducto, setFiltroTipoProducto] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");

  const handleSubmit = async (producto) => {
    try {
      console.log("🔄 Iniciando guardado de producto:", producto);
      
      if (selectedProducto) {
        console.log("✏️ Editando producto:", selectedProducto.idProducto);
        await editProducto(selectedProducto.idProducto, producto);
        success("Producto actualizado exitosamente");
      } else {
        console.log("➕ Creando nuevo producto");
        await addProducto(producto);
        success("Producto creado exitosamente");
      }
      
      // Recargar la lista
      await loadProductos();
      setShowForm(false);
      setSelectedProducto(null);
    } catch (error) {
      console.error("❌ Error al guardar el producto:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el producto";
      showError(errorMsg);
    }
  };

  // Obtener categorías únicas para los filtros
  const categoriasUnicas = useMemo(() => {
    const categorias = productos
      .map(p => p.categoria)
      .filter(Boolean)
      .map(c => ({ idCategoria: c.idCategoria, nombreCategoria: c.nombreCategoria }))
      .filter((c, index, self) => 
        index === self.findIndex((t) => t.idCategoria === c.idCategoria)
      );
    return categorias;
  }, [productos]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideNombre = filtroNombre === "" || 
        producto.nombreProducto?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideCodigo = filtroCodigo === "" || 
        producto.codigoBarra?.toLowerCase().includes(filtroCodigo.toLowerCase());
      const coincideCategoria = filtroCategoria === "todos" || 
        producto.categoria?.idCategoria === parseInt(filtroCategoria);
      const coincideTipoProducto = filtroTipoProducto === "todos" || 
        producto.tipoProducto === filtroTipoProducto;
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && producto.estadoProducto) ||
        (filtroEstado === "inactivo" && !producto.estadoProducto);
      const precioVenta = producto.precioVenta || 0;
      const coincidePrecioMin = filtroPrecioMin === "" || precioVenta >= parseFloat(filtroPrecioMin);
      const coincidePrecioMax = filtroPrecioMax === "" || precioVenta <= parseFloat(filtroPrecioMax);
      
      return coincideNombre && coincideCodigo && coincideCategoria && 
             coincideTipoProducto && coincideEstado && coincidePrecioMin && coincidePrecioMax;
    });
  }, [productos, filtroNombre, filtroCodigo, filtroCategoria, filtroTipoProducto, filtroEstado, filtroPrecioMin, filtroPrecioMax]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroCodigo("");
    setFiltroCategoria("todos");
    setFiltroTipoProducto("todos");
    setFiltroEstado("todos");
    setFiltroPrecioMin("");
    setFiltroPrecioMax("");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroCodigo !== "" || 
    filtroCategoria !== "todos" || filtroTipoProducto !== "todos" || filtroEstado !== "todos" || 
    filtroPrecioMin !== "" || filtroPrecioMax !== "";

  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra tu inventario de productos</span>
            )}
          </p>
        </div>
        {!showForm && !organizacionVista && (
          <PermisoGuard permiso="productos.crear">
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedProducto(null);
              }}
              className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
            >
              + Nuevo Producto
            </button>
          </PermisoGuard>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedProducto ? "Editar Producto" : "Nuevo Producto"}
          </h2>
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
        <>
          {/* FILTROS */}
          <div className="bg-white rounded-xl shadow p-4 mb-6 border-l-4 border-[#2B3E3C]">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#2B3E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-semibold text-[#2B3E3C]">Filtros de Búsqueda</h3>
              {tieneFiltrosActivos && (
                <span className="ml-auto text-sm text-gray-600">
                  {productosFiltrados.length} de {productos.length} productos
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre del producto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Código de Barras */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏷️ Código de Barras
                </label>
                <input
                  type="text"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Buscar por código de barras..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📁 Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todas las categorías</option>
                  {categoriasUnicas.map((cat) => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombreCategoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Tipo de Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📦 Tipo de Producto
                </label>
                <select
                  value={filtroTipoProducto}
                  onChange={(e) => setFiltroTipoProducto(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="PRODUCTO">Producto</option>
                  <option value="SERVICIO">Servicio</option>
                  <option value="MATERIA_PRIMA">Materia Prima</option>
                  <option value="INSUMO">Insumo</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📊 Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>

              {/* Filtro por Precio Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💰 Precio Mínimo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filtroPrecioMin}
                  onChange={(e) => setFiltroPrecioMin(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Precio Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💰 Precio Máximo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filtroPrecioMax}
                  onChange={(e) => setFiltroPrecioMax(e.target.value)}
                  placeholder="999999.99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>
            </div>

            {tieneFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                🗑️ Limpiar Filtros
              </button>
            )}
          </div>

          {/* TABLA DE PRODUCTOS */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
                <p className="mt-4 text-gray-500">Cargando productos...</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>
                  {tieneFiltrosActivos 
                    ? "No se encontraron productos con los filtros aplicados." 
                    : "No hay productos registrados."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2B3E3C] text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Código Barras</th>
                      <th className="p-3 text-left">Categoría</th>
                      <th className="p-3 text-left">Proveedor</th>
                      <th className="p-3 text-left">Tipo</th>
                      <th className="p-3 text-left">Precio Compra</th>
                      <th className="p-3 text-left">Precio Venta</th>
                      <th className="p-3 text-left">Maneja Stock</th>
                      <th className="p-3 text-left">Estado</th>
                      {!organizacionVista && (
                        <th className="p-3 text-center">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map((p) => (
                      <tr key={p.idProducto} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">{p.idProducto}</td>
                        <td className="p-3 font-medium">{p.nombreProducto}</td>
                        <td className="p-3">{p.codigoBarra || "-"}</td>
                        <td className="p-3">{p.categoria?.nombreCategoria || "-"}</td>
                        <td className="p-3">{p.proveedor?.nombreComercial || p.proveedor?.nombre || "-"}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            {p.tipoProducto || "-"}
                          </span>
                        </td>
                        <td className="p-3">${p.precioCompra?.toFixed(2) || "0.00"}</td>
                        <td className="p-3 font-semibold text-green-600">${p.precioVenta?.toFixed(2) || "0.00"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              p.manejaStock
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {p.manejaStock ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="p-3">
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
                        {!organizacionVista && (
                          <td className="p-3 text-center space-x-3">
                            <PermisoGuard permiso="productos.editar">
                              <button
                                onClick={() => {
                                  setSelectedProducto(p);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                              >
                                Editar
                              </button>
                            </PermisoGuard>
                            <PermisoGuard permiso="productos.eliminar">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`¿Estás seguro de eliminar el producto "${p.nombreProducto}"?`)) {
                                    try {
                                      await removeProducto(p.idProducto);
                                      await loadProductos();
                                      success("Producto eliminado exitosamente");
                                    } catch (error) {
                                      showError("Error al eliminar el producto");
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                              >
                                Eliminar
                              </button>
                            </PermisoGuard>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
