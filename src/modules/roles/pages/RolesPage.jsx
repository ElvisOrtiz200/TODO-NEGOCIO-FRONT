import { useState, useMemo } from "react";
import { useRoles } from "../hooks/useRoles";
import RolForm from "../components/RolForm";
import AsignarPermisosModal from "../components/AsignarPermisosModal";
import { usePermissions } from "../../../hooks/usePermissions";
import PermisoGuard from "../../../components/PermisoGuard";

export default function RolesPage() {
  const { roles, loading, error, addRol, editRol, removeRol, reloadRoles } = useRoles();
  const { isSuperAdmin, tienePermiso, loading: permissionsLoading } = usePermissions();
  const [showForm, setShowForm] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [rolParaPermisos, setRolParaPermisos] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroDescripcion, setFiltroDescripcion] = useState("");

  // Determinar permisos: superadmin puede todo, usuarios normales solo ver
  const puedeCrear = isSuperAdmin || tienePermiso("roles.crear");
  const puedeEditar = isSuperAdmin || tienePermiso("roles.editar");
  const puedeEliminar = isSuperAdmin || tienePermiso("roles.eliminar");
  const puedeAsignarPermisos = isSuperAdmin || tienePermiso("roles.asignar_permisos");
  const puedeVer = isSuperAdmin || tienePermiso("roles.ver");

  const handleSubmit = async (rol) => {
    try {
      console.log("🔄 Iniciando guardado de rol:", rol);
      
      let resultado;
      
      if (selectedRol) {
        // Editar rol existente
        console.log("✏️ Editando rol:", selectedRol.idRol);
        resultado = await editRol(selectedRol.idRol, rol);
      } else {
        // Crear nuevo rol
        console.log("➕ Creando nuevo rol");
        resultado = await addRol(rol);
      }
      
      console.log("📊 Resultado del guardado:", resultado);
      
      if (resultado && resultado.success) {
        // Recargar la lista de roles para asegurar sincronización
        console.log("🔄 Recargando lista de roles...");
        await reloadRoles();
        setShowForm(false);
        setSelectedRol(null);
        // Mostrar mensaje de éxito
        alert(selectedRol ? "✅ Rol actualizado exitosamente" : "✅ Rol creado exitosamente");
      } else {
        // Si hay error en el resultado
        const errorMsg = resultado?.error || "Error desconocido al guardar el rol";
        console.error("❌ Error al guardar el rol:", errorMsg);
        alert(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("❌ Excepción al guardar el rol:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el rol";
      alert(`❌ Error al guardar el rol: ${errorMsg}`);
    }
  };

  const handleAsignarPermisos = (rol) => {
    setRolParaPermisos(rol);
    setShowPermisosModal(true);
  };

  const handlePermisosGuardados = () => {
    reloadRoles();
  };

  // Filtrar roles
  const rolesFiltrados = useMemo(() => {
    return roles.filter((rol) => {
      const coincideNombre = filtroNombre === "" || 
        rol.nombreRol?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && rol.estadoRol) ||
        (filtroEstado === "inactivo" && !rol.estadoRol);
      const coincideDescripcion = filtroDescripcion === "" || 
        rol.descripcionRol?.toLowerCase().includes(filtroDescripcion.toLowerCase());
      
      return coincideNombre && coincideEstado && coincideDescripcion;
    });
  }, [roles, filtroNombre, filtroEstado, filtroDescripcion]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEstado("todos");
    setFiltroDescripcion("");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroEstado !== "todos" || filtroDescripcion !== "";

  // Si no tiene permisos para ver, mostrar mensaje
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

  if (!puedeVer) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p>No tienes permisos para ver los roles del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSuperAdmin 
              ? "Administra los roles del sistema y asigna permisos (Superadmin)" 
              : "Visualiza los roles disponibles en el sistema"}
          </p>
        </div>
        {!showForm && puedeCrear && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedRol(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Rol
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Mensaje informativo para usuarios con solo lectura */}
      {!puedeCrear && !puedeEditar && !puedeEliminar && puedeVer && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <p className="font-medium">ℹ️ Modo de solo lectura</p>
          <p className="text-xs mt-1">
            Solo puedes visualizar los roles. Para crear, editar o eliminar roles, necesitas los permisos correspondientes.
          </p>
        </div>
      )}

      {/* FORMULARIO */}
      {showForm && puedeCrear ? (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedRol ? "Editar Rol" : "Nuevo Rol"}
          </h2>
          <RolForm
            initialData={selectedRol}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedRol(null);
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
                  {rolesFiltrados.length} de {roles.length} roles
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Ej: Administrador, Usuario..."
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

              {/* Filtro por Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Buscar en Descripción
                </label>
                <input
                  type="text"
                  value={filtroDescripcion}
                  onChange={(e) => setFiltroDescripcion(e.target.value)}
                  placeholder="Buscar en descripción..."
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

          {/* TABLA DE ROLES */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
              <p className="mt-4 text-gray-500">Cargando roles...</p>
            </div>
          ) : rolesFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {tieneFiltrosActivos 
                  ? "No se encontraron roles con los filtros aplicados." 
                  : "No hay roles registrados."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesFiltrados.map((rol) => (
                    <tr key={rol.idRol} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{rol.idRol}</td>
                      <td className="p-3 font-medium">{rol.nombreRol}</td>
                      <td className="p-3 text-gray-600">
                        {rol.descripcionRol || "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            rol.estadoRol
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rol.estadoRol ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-3">
                        {puedeEditar && (
                          <button
                            onClick={() => {
                              setSelectedRol(rol);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                          >
                            Editar
                          </button>
                        )}
                        {puedeAsignarPermisos && (
                          <button
                            onClick={() => handleAsignarPermisos(rol)}
                            className="text-purple-600 hover:text-purple-800 hover:underline text-sm font-medium"
                          >
                            Permisos
                          </button>
                        )}
                        {puedeEliminar && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar el rol "${rol.nombreRol}"?`)) {
                                removeRol(rol.idRol);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        )}
                        {!puedeEditar && !puedeAsignarPermisos && !puedeEliminar && (
                          <span className="text-gray-400 text-sm">Solo lectura</span>
                        )}
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

      {/* MODAL DE PERMISOS */}
      {showPermisosModal && rolParaPermisos && (
        <AsignarPermisosModal
          rol={rolParaPermisos}
          onClose={() => {
            setShowPermisosModal(false);
            setRolParaPermisos(null);
          }}
          onSuccess={handlePermisosGuardados}
        />
      )}
    </div>
  );
}


