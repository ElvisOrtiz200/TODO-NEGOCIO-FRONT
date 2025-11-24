import { useState, useMemo, useEffect } from "react";
import { useAlmacenes } from "../hooks/useAlmacenes";
import AlmacenForm from "../components/AlmacenForm";
import { useToast } from "../../../components/ToastContainer";
import { usePermissions } from "../../../hooks/usePermissions";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { getOrganizaciones } from "../../organizaciones/services/organizacionService";

export default function AlmacenesPage() {
  const { almacenes, loading, addAlmacen, editAlmacen, removeAlmacen, loadAlmacenes } = useAlmacenes();
  const { isSuperAdmin } = usePermissions();
  const { organizacionVista } = useOrganizacion();
  const { success, error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);

  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroOrganizacion, setFiltroOrganizacion] = useState("");
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Cargar organizaciones solo si es superadmin
  useEffect(() => {
    if (isSuperAdmin) {
      const loadOrganizaciones = async () => {
        try {
          setLoadingOrgs(true);
          const data = await getOrganizaciones();
          setOrganizaciones(data);
        } catch (error) {
          console.error("Error al cargar organizaciones:", error);
        } finally {
          setLoadingOrgs(false);
        }
      };
      loadOrganizaciones();
    }
  }, [isSuperAdmin]);

  const handleSubmit = async (almacen) => {
    try {
      if (selectedAlmacen) {
        await editAlmacen(selectedAlmacen.idAlmacen, almacen);
        success("Almacén actualizado exitosamente");
      } else {
        await addAlmacen(almacen);
        success("Almacén creado exitosamente");
      }
      // Recargar la lista
      await loadAlmacenes(isSuperAdmin);
      setShowForm(false);
      setSelectedAlmacen(null);
    } catch (error) {
      console.error("Error al guardar el almacén:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el almacén";
      showError(errorMsg);
    }
  };

  const handleDelete = async (idAlmacen, nombreAlmacen) => {
    if (window.confirm(`¿Estás seguro de eliminar el almacén "${nombreAlmacen}"?`)) {
      try {
        await removeAlmacen(idAlmacen);
        await loadAlmacenes(isSuperAdmin);
        success("Almacén eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar el almacén:", error);
        const errorMsg = error?.message || error?.toString() || "Error al eliminar el almacén";
        showError(errorMsg);
      }
    }
  };

  // Filtrar almacenes
  const almacenesFiltrados = useMemo(() => {
    return almacenes.filter((alm) => {
      const coincideNombre = filtroNombre === "" || 
        alm.nombreAlmacen?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideUbicacion = filtroUbicacion === "" || 
        alm.ubicacionAlmacen?.toLowerCase().includes(filtroUbicacion.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && alm.estadoAlmacen) ||
        (filtroEstado === "inactivo" && !alm.estadoAlmacen);
      const coincideOrganizacion = !isSuperAdmin || filtroOrganizacion === "" || 
        alm.idOrganizacion === filtroOrganizacion ||
        alm.organizacion?.idOrganizacion === filtroOrganizacion;
      
      return coincideNombre && coincideUbicacion && coincideEstado && coincideOrganizacion;
    });
  }, [almacenes, filtroNombre, filtroUbicacion, filtroEstado, filtroOrganizacion, isSuperAdmin]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroUbicacion("");
    setFiltroEstado("todos");
    setFiltroOrganizacion("");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroUbicacion !== "" || filtroEstado !== "todos" || (isSuperAdmin && filtroOrganizacion !== "");

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Almacenes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra los almacenes de tu organización</span>
            )}
          </p>
        </div>
        {!showForm && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedAlmacen(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Almacén
          </button>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedAlmacen ? "Editar Almacén" : "Nuevo Almacén"}
          </h2>
          <AlmacenForm
            initialData={selectedAlmacen}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedAlmacen(null);
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
                  {almacenesFiltrados.length} de {almacenes.length} almacenes
                </span>
              )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre del almacén..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📍 Buscar por Ubicación
                </label>
                <input
                  type="text"
                  value={filtroUbicacion}
                  onChange={(e) => setFiltroUbicacion(e.target.value)}
                  placeholder="Ubicación del almacén..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
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

              {/* Filtro por Organización - Solo para superadmin */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏢 Organización
                  </label>
                  {loadingOrgs ? (
                    <p className="text-sm text-gray-500">Cargando...</p>
                  ) : (
                    <select
                      value={filtroOrganizacion}
                      onChange={(e) => setFiltroOrganizacion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                    >
                      <option value="">Todas las organizaciones</option>
                      {organizaciones.map((org) => (
                        <option key={org.idOrganizacion} value={org.idOrganizacion}>
                          {org.nombreOrganizacion}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
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

          {/* TABLA DE ALMACENES */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
                <p className="mt-4 text-gray-500">Cargando almacenes...</p>
              </div>
            ) : almacenesFiltrados.length === 0 ? (
              <p className="p-8 text-gray-500">
                {tieneFiltrosActivos
                  ? "No se encontraron almacenes con los filtros aplicados."
                  : "No hay almacenes registrados."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2B3E3C] text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Ubicación</th>
                      {isSuperAdmin && !organizacionVista && (
                        <th className="p-3 text-left">Organización</th>
                      )}
                      <th className="p-3 text-left">Estado</th>
                      {!organizacionVista && (
                        <th className="p-3 text-center">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {almacenesFiltrados.map((alm) => (
                      <tr key={alm.idAlmacen} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">{alm.idAlmacen}</td>
                        <td className="p-3 font-medium">{alm.nombreAlmacen}</td>
                        <td className="p-3 text-gray-600">{alm.ubicacionAlmacen}</td>
                        {isSuperAdmin && !organizacionVista && (
                          <td className="p-3 text-gray-600">
                            {alm.organizacion?.nombreOrganizacion || "-"}
                          </td>
                        )}
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              alm.estadoAlmacen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {alm.estadoAlmacen ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        {!organizacionVista && (
                          <td className="p-3 text-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedAlmacen(alm);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(alm.idAlmacen, alm.nombreAlmacen)}
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
