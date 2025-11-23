import { useState, useMemo } from "react";
import { usePermisos } from "../hooks/usePermisos";
import PermisoForm from "../components/PermisoForm";

export default function PermisosPage() {
  const { permisos, loading, addPermiso, editPermiso, removePermiso, loadPermisos } = usePermisos();
  const [showForm, setShowForm] = useState(false);
  const [selectedPermiso, setSelectedPermiso] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const handleSubmit = async (permiso) => {
    try {
      console.log("🔄 Iniciando guardado de permiso:", permiso);
      
      if (selectedPermiso) {
        console.log("✏️ Editando permiso:", selectedPermiso.idPermiso);
        await editPermiso(selectedPermiso.idPermiso, permiso);
        alert("✅ Permiso actualizado exitosamente");
      } else {
        console.log("➕ Creando nuevo permiso");
        await addPermiso(permiso);
        alert("✅ Permiso creado exitosamente");
      }
      
      // Recargar la lista
      await loadPermisos();
      setShowForm(false);
      setSelectedPermiso(null);
    } catch (error) {
      console.error("❌ Error al guardar el permiso:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el permiso";
      
      // Mensaje más específico para errores 403
      if (errorMsg.includes("403") || errorMsg.includes("Forbidden") || errorMsg.includes("row-level security")) {
        alert("❌ Error: No tienes permisos para crear/editar permisos. Solo los superadmins pueden realizar esta acción.\n\nSi eres superadmin, verifica las políticas RLS en Supabase ejecutando el script POLITICAS_RLS_PERMISO.sql");
      } else {
        alert(`❌ Error al guardar el permiso: ${errorMsg}`);
      }
    }
  };

  // Filtrar permisos
  const permisosFiltrados = useMemo(() => {
    return permisos.filter((permiso) => {
      const coincideNombre = filtroNombre === "" || 
        permiso.nombrePermiso?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && permiso.estadoPermiso) ||
        (filtroEstado === "inactivo" && !permiso.estadoPermiso);
      
      return coincideNombre && coincideEstado;
    });
  }, [permisos, filtroNombre, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEstado("todos");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroEstado !== "todos";

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Gestión de Permisos
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedPermiso(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nuevo Permiso
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <PermisoForm
            initialData={selectedPermiso}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedPermiso(null);
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
                  {permisosFiltrados.length} de {permisos.length} permisos
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Ej: productos.crear, usuarios.editar..."
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

          {/* TABLA DE PERMISOS */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <p className="p-4 text-gray-500">Cargando permisos...</p>
            ) : permisosFiltrados.length === 0 ? (
              <p className="p-4 text-gray-500">
                {tieneFiltrosActivos 
                  ? "No se encontraron permisos con los filtros aplicados." 
                  : "No hay permisos registrados."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2B3E3C] text-white">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Nombre</th>
                      <th className="p-2 text-left">Estado</th>
                      <th className="p-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permisosFiltrados.map((permiso) => (
                    <tr key={permiso.idPermiso} className="border-b hover:bg-gray-50">
                      <td className="p-2">{permiso.idPermiso}</td>
                      <td className="p-2">{permiso.nombrePermiso}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            permiso.estadoPermiso
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {permiso.estadoPermiso ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-2 text-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedPermiso(permiso);
                            setShowForm(true);
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removePermiso(permiso.idPermiso)}
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
        </>
      )}
    </div>
  );
}

