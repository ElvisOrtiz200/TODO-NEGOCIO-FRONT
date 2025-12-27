import { useState, useEffect, useCallback, useMemo } from "react";
import { getUsuariosSinOrganizacion, asignarUsuarioAOrganizacion, getUsuarios } from "../../usuarios/services/usuarioService";
import { asignarRolesAUsuario } from "../../usuarios/services/usuarioRolService";
import { useRoles } from "../../roles/hooks/useRoles";
import { usePermissions } from "../../../hooks/usePermissions";

export default function AsignarUsuariosModal({ organizacion, onClose, onSuccess }) {
  const { roles, loading: rolesLoading } = useRoles();
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosAsignados, setUsuariosAsignados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAsignados, setLoadingAsignados] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [asignando, setAsignando] = useState(false);
  const { isSuperAdmin } = usePermissions();

  const existeAdministrador = useMemo(() => {
    if (!usuariosAsignados || usuariosAsignados.length === 0) return false;
    return usuariosAsignados.some((usuario) => {
      const rolesActivos = Array.isArray(usuario.roles)
        ? usuario.roles.filter(
            (rolUsuario) => rolUsuario?.estadoUsuarioRol && rolUsuario?.rol?.nombreRol
          )
        : [];
      return rolesActivos.some(
        (rolUsuario) => rolUsuario.rol?.nombreRol?.toUpperCase() === "ADMINISTRADOR"
      );
    });
  }, [usuariosAsignados]);

  const requiereAutorizacionSuperadmin =
    isSuperAdmin && existeAdministrador && !organizacion?.autorizaSuperadminUsuarios;
  const puedeGestionarAsignaciones = !requiereAutorizacionSuperadmin;

  const loadUsuariosSinOrganizacion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsuariosSinOrganizacion();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      alert("Error al cargar usuarios sin organización");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsuariosAsignados = useCallback(async () => {
    if (!organizacion?.idOrganizacion) {
      setUsuariosAsignados([]);
      return;
    }
    try {
      setLoadingAsignados(true);
      const data = await getUsuarios(organizacion.idOrganizacion);
      setUsuariosAsignados(data || []);
    } catch (error) {
      console.error("Error cargando usuarios asignados:", error);
    } finally {
      setLoadingAsignados(false);
    }
  }, [organizacion?.idOrganizacion]);

  useEffect(() => {
    if (organizacion) {
      loadUsuariosSinOrganizacion();
      loadUsuariosAsignados();
    }
  }, [organizacion, loadUsuariosAsignados, loadUsuariosSinOrganizacion]);

  const handleAsignarUsuario = async () => {
    if (!selectedUsuario || rolesSeleccionados.length === 0) {
      alert("Debes seleccionar un usuario y al menos un rol");
      return;
    }

    if (requiereAutorizacionSuperadmin) {
      alert("Necesitas autorización del Administrador de la organización para seguir asignando usuarios.");
      return;
    }

    setAsignando(true);
    try {
      // Asignar usuario a la organización
      await asignarUsuarioAOrganizacion(selectedUsuario.idUsuario, organizacion.idOrganizacion);
      
      // Asignar roles al usuario
      await asignarRolesAUsuario(selectedUsuario.idUsuario, rolesSeleccionados);

      await Promise.all([loadUsuariosAsignados(), loadUsuariosSinOrganizacion()]);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error asignando usuario:", error);
      alert("Error al asignar usuario. Por favor, intenta de nuevo.");
    } finally {
      setAsignando(false);
    }
  };

  const handleToggleRol = (idRol) => {
    setRolesSeleccionados((prev) =>
      prev.includes(idRol)
        ? prev.filter((id) => id !== idRol)
        : [...prev, idRol]
    );
  };

  if (!organizacion) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Asignar Usuario a: {organizacion.nombreOrganizacion}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un usuario sin organización y asígnale roles
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Usuarios actualmente asignados</h3>
                <p className="text-xs text-gray-500">
                  Visualiza quién ya pertenece a esta organización y sus roles activos.
                </p>
              </div>
              <span className="text-xs font-medium text-gray-600">
                Total: {usuariosAsignados.length}
              </span>
            </div>
            {loadingAsignados ? (
              <div className="flex items-center justify-center py-6">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B3E3C]"></div>
              </div>
            ) : usuariosAsignados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aún no hay usuarios asignados a esta organización.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="pb-2 pr-3 font-medium">Usuario</th>
                      <th className="pb-2 pr-3 font-medium">Correo</th>
                      <th className="pb-2 font-medium">Roles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuariosAsignados.map((usuario) => {
                      const rolesActivos = Array.isArray(usuario.roles)
                        ? usuario.roles.filter(
                            (rolUsuario) => rolUsuario?.estadoUsuarioRol && rolUsuario?.rol?.nombreRol
                          )
                        : [];
                      const rolesTexto =
                        rolesActivos.length > 0
                          ? rolesActivos.map((rolUsuario) => rolUsuario.rol.nombreRol).join(", ")
                          : usuario.rol?.nombreRol || "Sin rol asignado";

                      return (
                        <tr key={usuario.idUsuario}>
                          <td className="py-2 pr-3 text-gray-800 font-medium">{usuario.nombreUsuario}</td>
                          <td className="py-2 pr-3 text-gray-600">{usuario.emailUsuario}</td>
                          <td className="py-2 text-gray-700">{rolesTexto}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {requiereAutorizacionSuperadmin && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Esta organización ya cuenta con un Administrador activo. Solicita autorización al
              Administrador para que el superadmin pueda seguir asignando usuarios o roles desde este módulo.
            </div>
          )}

          {/* SELECCIÓN DE USUARIO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B3E3C]"></div>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No hay usuarios sin organización disponibles.</p>
              </div>
            ) : (
              <select
                value={selectedUsuario?.idUsuario || ""}
                onChange={(e) => {
                  const usuario = usuarios.find((u) => u.idUsuario === parseInt(e.target.value));
                  setSelectedUsuario(usuario);
                  setRolesSeleccionados([]);
                }}
                disabled={!puedeGestionarAsignaciones}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.idUsuario} value={usuario.idUsuario}>
                    {usuario.nombreUsuario} ({usuario.emailUsuario})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SELECCIÓN DE ROLES */}
          {selectedUsuario && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles <span className="text-red-500">*</span>
              </label>
              {rolesLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B3E3C]"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {roles.map((rol) => (
                    <label
                      key={rol.idRol}
                      className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={rolesSeleccionados.includes(rol.idRol)}
                        onChange={() => handleToggleRol(rol.idRol)}
                        disabled={!puedeGestionarAsignaciones}
                        className="w-4 h-4 text-[#2B3E3C] border-gray-300 rounded focus:ring-[#2B3E3C] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-800">
                        {rol.nombreRol}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={asignando}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAsignarUsuario}
              disabled={
                asignando ||
                !selectedUsuario ||
                rolesSeleccionados.length === 0 ||
                !puedeGestionarAsignaciones
              }
              className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors disabled:opacity-50"
            >
              {asignando ? "Asignando..." : "Asignar Usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

