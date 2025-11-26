import { useState, useMemo } from "react";
import { useUnidadesMedida } from "../hooks/useUnidadesMedida";
import UnidadMedidaForm from "../components/UnidadMedidaForm";
import { useToast } from "../../../components/ToastContainer";
import SuperAdminRoute from "../../../components/SuperAdminRoute";

function UnidadesMedidaPage() {
  const {
    unidadesMedida,
    loading,
    addUnidadMedida,
    editUnidadMedida,
    removeUnidadMedida,
    loadUnidadesMedida,
  } = useUnidadesMedida();
  const { success, error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroId, setFiltroId] = useState("");

  const handleSubmit = async (unidadMedida) => {
    try {
      console.log("🔄 Iniciando guardado de unidad de medida:", unidadMedida);

      if (selectedUnidad) {
        console.log("✏️ Editando unidad de medida:", selectedUnidad.idUnidadMedida);
        await editUnidadMedida(selectedUnidad.idUnidadMedida, unidadMedida);
        success("Unidad de medida actualizada exitosamente");
      } else {
        console.log("➕ Creando nueva unidad de medida");
        await addUnidadMedida(unidadMedida);
        success("Unidad de medida creada exitosamente");
      }

      // Recargar la lista
      await loadUnidadesMedida();
      setShowForm(false);
      setSelectedUnidad(null);
    } catch (error) {
      console.error("❌ Error al guardar la unidad de medida:", error);
      const errorMsg =
        error?.message ||
        error?.toString() ||
        "Error desconocido al guardar la unidad de medida";
      showError(errorMsg);
    }
  };

  // Filtrar unidades de medida
  const unidadesFiltradas = useMemo(() => {
    return unidadesMedida.filter((unidad) => {
      const coincideNombre = filtroNombre === "" || 
        unidad.nombreUnidadMedida?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideId = filtroId === "" || 
        String(unidad.idUnidadMedida).includes(filtroId);
      
      return coincideNombre && coincideId;
    });
  }, [unidadesMedida, filtroNombre, filtroId]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroId("");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroId !== "";

  return (
    <SuperAdminRoute>
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#2B3E3C]">
              Gestión de Unidades de Medida
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra las unidades de medida del sistema
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedUnidad(null);
              }}
              className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
            >
              + Nueva Unidad de Medida
            </button>
          )}
        </div>

        {/* FORMULARIO */}
        {showForm ? (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedUnidad ? "Editar Unidad de Medida" : "Nueva Unidad de Medida"}
            </h2>
            <UnidadMedidaForm
              initialData={selectedUnidad}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedUnidad(null);
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
                    {unidadesFiltradas.length} de {unidadesMedida.length} unidades
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
                    placeholder="Nombre de la unidad..."
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
                    placeholder="ID de la unidad..."
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

            {/* TABLA DE UNIDADES DE MEDIDA */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
                  <p className="mt-4 text-gray-500">Cargando unidades de medida...</p>
                </div>
              ) : unidadesFiltradas.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>
                    {tieneFiltrosActivos 
                      ? "No se encontraron unidades de medida con los filtros aplicados." 
                      : "No hay unidades de medida registradas."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#2B3E3C] text-white">
                      <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Nombre</th>
                        <th className="p-3 text-left">Fecha de Registro</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unidadesFiltradas.map((u) => (
                      <tr
                        key={u.idUnidadMedida}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">{u.idUnidadMedida}</td>
                        <td className="p-3 font-medium">{u.nombreUnidadMedida}</td>
                        <td className="p-3 text-gray-600">
                          {u.fechaRegistroUnidad
                            ? new Date(u.fechaRegistroUnidad).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-3 text-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedUnidad(u);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `¿Estás seguro de eliminar la unidad de medida "${u.nombreUnidadMedida}"?`
                                )
                              ) {
                                try {
                                  await removeUnidadMedida(u.idUnidadMedida);
                                  await loadUnidadesMedida();
                                  success("Unidad de medida eliminada exitosamente");
                                } catch (err) {
                                  console.error("Error al eliminar unidad de medida:", err);
                                  showError("Error al eliminar la unidad de medida");
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
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
          </>
        )}
      </div>
    </SuperAdminRoute>
  );
}

export default UnidadesMedidaPage;

