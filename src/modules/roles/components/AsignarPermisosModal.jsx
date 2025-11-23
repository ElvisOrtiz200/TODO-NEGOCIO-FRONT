import { useState, useEffect } from "react";
import { usePermisos } from "../../permisos/hooks/usePermisos";
import { asignarPermisosARol, getPermisosByRol } from "../../rolesPermisos/services/rolPermisoService";

export default function AsignarPermisosModal({ rol, onClose, onSuccess }) {
  const { permisos, loading: permisosLoading } = usePermisos();
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rol) {
      loadPermisosRol();
    }
  }, [rol]);

  const loadPermisosRol = async () => {
    try {
      const permisosRol = await getPermisosByRol(rol.idRol);
      const idsPermisos = permisosRol
        .filter((rp) => rp.estadoRolPermiso)
        .map((rp) => rp.idPermiso);
      setPermisosSeleccionados(idsPermisos);
    } catch (error) {
      console.error("Error cargando permisos del rol:", error);
    }
  };

  const handleTogglePermiso = (idPermiso) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(idPermiso)
        ? prev.filter((id) => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("🔄 Asignando permisos al rol:", {
        idRol: rol.idRol,
        nombreRol: rol.nombreRol,
        permisosSeleccionados: permisosSeleccionados.length
      });
      
      await asignarPermisosARol(rol.idRol, permisosSeleccionados);
      
      console.log("✅ Permisos asignados exitosamente");
      alert("✅ Permisos asignados exitosamente");
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Error asignando permisos:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido";
      
      // Mensaje más específico para errores 403
      if (errorMsg.includes("403") || errorMsg.includes("Forbidden") || errorMsg.includes("row-level security")) {
        alert("❌ Error: No tienes permisos para asignar permisos a roles. Solo los superadmins pueden realizar esta acción.\n\nSi eres superadmin, verifica las políticas RLS en Supabase ejecutando el script POLITICAS_RLS_ROLPERMISO.sql");
      } else {
        alert(`❌ Error al asignar permisos: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!rol) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Asignar Permisos a: {rol.nombreRol}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona los permisos que tendrá este rol
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {permisosLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
              <p className="mt-4 text-gray-500">Cargando permisos...</p>
            </div>
          ) : permisos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay permisos disponibles.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {permisos.map((permiso) => (
                <label
                  key={permiso.idPermiso}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permisosSeleccionados.includes(permiso.idPermiso)}
                    onChange={() => handleTogglePermiso(permiso.idPermiso)}
                    className="w-4 h-4 text-[#2B3E3C] border-gray-300 rounded focus:ring-[#2B3E3C]"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {permiso.nombrePermiso}
                    </p>
                    {permiso.descripcionPermiso && (
                      <p className="text-xs text-gray-500 mt-1">
                        {permiso.descripcionPermiso}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Permisos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

