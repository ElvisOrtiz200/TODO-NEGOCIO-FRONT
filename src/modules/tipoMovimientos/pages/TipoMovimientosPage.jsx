import { useState, useMemo } from "react";
import { useTipoMovimientos } from "../hooks/useTipoMovimientos";
import TipoMovimientoForm from "../components/TipoMovimientoForm";
import { useToast } from "../../../components/ToastContainer";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export default function TipoMovimientosPage() {
  const {
    tipoMovimientos,
    loading,
    addTipoMovimiento,
    editTipoMovimiento,
    removeTipoMovimiento,
    loadTipoMovimientos,
  } = useTipoMovimientos();
  const { success, error: showError } = useToast();
  const { organizacionVista } = useOrganizacion();
  const [showForm, setShowForm] = useState(false);
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState(null);
  
  // Estados para filtros
  const [filtroDescripcion, setFiltroDescripcion] = useState("");
  const [filtroNaturaleza, setFiltroNaturaleza] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const handleSubmit = async (tipoMovimiento) => {
    try {
      if (selectedTipoMovimiento) {
        await editTipoMovimiento(selectedTipoMovimiento.idTipoMovimiento, tipoMovimiento);
        success("Tipo de movimiento actualizado exitosamente");
      } else {
        await addTipoMovimiento(tipoMovimiento);
        success("Tipo de movimiento creado exitosamente");
      }
      // Recargar la lista
      await loadTipoMovimientos();
      setShowForm(false);
      setSelectedTipoMovimiento(null);
    } catch (error) {
      console.error("Error al guardar el tipo de movimiento:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el tipo de movimiento";
      showError(errorMsg);
    }
  };

  const handleDelete = async (idTipoMovimiento, descripcion) => {
    if (window.confirm(`¿Estás seguro de eliminar el tipo de movimiento "${descripcion}"?`)) {
      try {
        await removeTipoMovimiento(idTipoMovimiento);
        await loadTipoMovimientos();
        success("Tipo de movimiento eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar el tipo de movimiento:", error);
        const errorMsg = error?.message || error?.toString() || "Error al eliminar el tipo de movimiento";
        showError(errorMsg);
      }
    }
  };

  // Filtrar tipos de movimiento
  const tiposMovimientoFiltrados = useMemo(() => {
    return tipoMovimientos.filter((tm) => {
      const coincideDescripcion = filtroDescripcion === "" || 
        tm.descripcionMovimiento?.toLowerCase().includes(filtroDescripcion.toLowerCase());
      const coincideNaturaleza = filtroNaturaleza === "todos" || 
        tm.naturaleza === filtroNaturaleza;
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && tm.estadoTipoMovimiento) ||
        (filtroEstado === "inactivo" && !tm.estadoTipoMovimiento);
      
      return coincideDescripcion && coincideNaturaleza && coincideEstado;
    });
  }, [tipoMovimientos, filtroDescripcion, filtroNaturaleza, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroDescripcion("");
    setFiltroNaturaleza("todos");
    setFiltroEstado("todos");
  };

  const tieneFiltrosActivos = filtroDescripcion !== "" || filtroNaturaleza !== "todos" || filtroEstado !== "todos";

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">
            Gestión de Tipos de Movimiento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra los tipos de movimiento de inventario</span>
            )}
          </p>
        </div>
        {!showForm && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedTipoMovimiento(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Tipo de Movimiento
          </button>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <TipoMovimientoForm
            initialData={selectedTipoMovimiento}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedTipoMovimiento(null);
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
                  {tiposMovimientoFiltrados.length} de {tipoMovimientos.length} tipos de movimiento
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Descripción
                </label>
                <input
                  type="text"
                  value={filtroDescripcion}
                  onChange={(e) => setFiltroDescripcion(e.target.value)}
                  placeholder="Descripción del movimiento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Naturaleza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📊 Naturaleza
                </label>
                <select
                  value={filtroNaturaleza}
                  onChange={(e) => setFiltroNaturaleza(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todas las naturalezas</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
              </div>

              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✅ Estado
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

          {/* TABLA DE TIPOS DE MOVIMIENTO */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <p className="p-4 text-gray-500">Cargando tipos de movimiento...</p>
            ) : tiposMovimientoFiltrados.length === 0 ? (
              <p className="p-4 text-gray-500">
                {tieneFiltrosActivos 
                  ? "No se encontraron tipos de movimiento con los filtros aplicados."
                  : "No hay tipos de movimiento registrados."}
              </p>
            ) : (
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-left">Naturaleza</th>
                    <th className="p-3 text-left">Fecha Registro</th>
                    <th className="p-3 text-left">Estado</th>
                    {!organizacionVista && (
                      <th className="p-3 text-center">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tiposMovimientoFiltrados.map((tm) => (
                  <tr key={tm.idTipoMovimiento} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">{tm.idTipoMovimiento}</td>
                    <td className="p-3 font-medium">{tm.descripcionMovimiento}</td>
                    <td className="p-3 text-gray-600">{tm.naturaleza}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(tm.fechaRegistroMovimiento).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tm.estadoTipoMovimiento
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tm.estadoTipoMovimiento ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {!organizacionVista && (
                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedTipoMovimiento(tm);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tm.idTipoMovimiento, tm.descripcionMovimiento)}
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
          )}
        </div>
        </>
      )}
    </div>
  );
}
