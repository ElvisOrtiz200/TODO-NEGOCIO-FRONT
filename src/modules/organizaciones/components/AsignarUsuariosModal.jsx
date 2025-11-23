import { useState, useEffect } from "react";
import { getUsuariosSinOrganizacion, asignarUsuarioAOrganizacion } from "../../usuarios/services/usuarioService";
import { asignarRolesAUsuario } from "../../usuarios/services/usuarioRolService";
import { useRoles } from "../../roles/hooks/useRoles";

export default function AsignarUsuariosModal({ organizacion, onClose, onSuccess }) {
  const { roles, loading: rolesLoading } = useRoles();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    if (organizacion) {
      loadUsuariosSinOrganizacion();
    }
  }, [organizacion]);

  const loadUsuariosSinOrganizacion = async () => {
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
  };

  const handleAsignarUsuario = async () => {
    if (!selectedUsuario || rolesSeleccionados.length === 0) {
      alert("Debes seleccionar un usuario y al menos un rol");
      return;
    }

    setAsignando(true);
    try {
      // Asignar usuario a la organización
      await asignarUsuarioAOrganizacion(selectedUsuario.idUsuario, organizacion.idOrganizacion);
      
      // Asignar roles al usuario
      await asignarRolesAUsuario(selectedUsuario.idUsuario, rolesSeleccionados);
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              >
                <option value="">Seleccionar usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.idUsuario} value={usuario.idUsuario}>
                    {usuario.nombreUsuario} ({usuario.email})
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
                        className="w-4 h-4 text-[#2B3E3C] border-gray-300 rounded focus:ring-[#2B3E3C]"
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
              disabled={asignando || !selectedUsuario || rolesSeleccionados.length === 0}
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

