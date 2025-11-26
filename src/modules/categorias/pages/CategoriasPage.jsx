import { useState, useMemo } from "react";
import { useCategorias } from "../hooks/useCategorias";
import CategoriaForm from "../components/CategoriaForm";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { useToast } from "../../../components/ToastContainer";

export default function CategoriasPage() {
  const { categorias, loading, addCategoria, editCategoria, removeCategoria, loadCategorias } = useCategorias();
  const { success, error: showError } = useToast();
  const { organizacionVista } = useOrganizacion();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroId, setFiltroId] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const handleSubmit = async (categoria) => {
    try {
      console.log("🔄 Iniciando guardado de categoría:", categoria);
      
      if (selectedCategoria) {
        console.log("✏️ Editando categoría:", selectedCategoria.idCategoria);
        await editCategoria(selectedCategoria.idCategoria, categoria);
        success("Categoría actualizada exitosamente");
      } else {
        console.log("➕ Creando nueva categoría");
        await addCategoria(categoria);
        success("Categoría creada exitosamente");
      }
      
      // Recargar la lista
      await loadCategorias();
      setShowForm(false);
      setSelectedCategoria(null);
    } catch (error) {
      console.error("❌ Error al guardar la categoría:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar la categoría";
      showError(errorMsg);
    }
  };

  // Filtrar categorías
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((categoria) => {
      const coincideNombre = filtroNombre === "" || 
        categoria.nombreCategoria?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideId = filtroId === "" || 
        String(categoria.idCategoria).includes(filtroId);
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && categoria.estadoCategoria) ||
        (filtroEstado === "inactivo" && !categoria.estadoCategoria);
      
      return coincideNombre && coincideId && coincideEstado;
    });
  }, [categorias, filtroNombre, filtroId, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroId("");
    setFiltroEstado("todos");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroId !== "" || filtroEstado !== "todos";

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra las categorías de productos</span>
            )}
          </p>
        </div>
        {!showForm && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedCategoria(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nueva Categoría
          </button>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <CategoriaForm
            initialData={selectedCategoria}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedCategoria(null);
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
                  {categoriasFiltradas.length} de {categorias.length} categorías
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre de la categoría..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🆔 Buscar por ID
                </label>
                <input
                  type="text"
                  value={filtroId}
                  onChange={(e) => setFiltroId(e.target.value)}
                  placeholder="ID de la categoría..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
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
                  <option value="activo">Activas</option>
                  <option value="inactivo">Inactivas</option>
                </select>
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

          {/* TABLA DE CATEGORÍAS */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
                <p className="mt-4 text-gray-500">Cargando categorías...</p>
              </div>
            ) : categoriasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>
                  {tieneFiltrosActivos 
                    ? "No se encontraron categorías con los filtros aplicados." 
                    : "No hay categorías registradas."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2B3E3C] text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Estado</th>
                      {!organizacionVista && (
                        <th className="p-3 text-center">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasFiltradas.map((cat) => (
                      <tr key={cat.idCategoria} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">{cat.idCategoria}</td>
                        <td className="p-3 font-medium">{cat.nombreCategoria}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              cat.estadoCategoria
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {cat.estadoCategoria ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        {!organizacionVista && (
                          <td className="p-3 text-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedCategoria(cat);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`¿Estás seguro de eliminar la categoría "${cat.nombreCategoria}"?`)) {
                                  try {
                                    await removeCategoria(cat.idCategoria);
                                    await loadCategorias();
                                    success("Categoría eliminada exitosamente");
                                  } catch (err) {
                                    console.error("Error al eliminar categoría:", err);
                                    showError("Error al eliminar la categoría");
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                            >
                              Eliminar
                            </button>
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
