import { useState, useEffect } from "react";
import { usePermisos } from "../../permisos/hooks/usePermisos";
import { useRolPermisos } from "../../rolesPermisos/hooks/useRolPermisos";

export default function AsignarPermisosModal({ rol, onClose }) {
  const { permisos, loading: loadingPermisos } = usePermisos();
  const { permisosRol, loading: loadingRolPermisos, actualizarPermisos } = useRolPermisos(rol?.idRol);
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (permisosRol) {
      const idsPermisos = permisosRol
        .filter((rp) => rp.estadoRolPermiso)
        .map((rp) => rp.idPermiso || rp.permiso?.idPermiso);
      setSelectedPermisos(idsPermisos);
    }
  }, [permisosRol]);

  const handleTogglePermiso = (idPermiso) => {
    setSelectedPermisos((prev) =>
      prev.includes(idPermiso)
        ? prev.filter((id) => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await actualizarPermisos(selectedPermisos);
      onClose();
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      alert("Error al guardar los permisos");
    } finally {
      setSaving(false);
    }
  };

  if (!rol) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Asignar Permisos a: {rol.nombreRol}
          </h2>
          <p className="text-gray-600 text-sm">
            Selecciona los permisos que tendrá este rol
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingPermisos || loadingRolPermisos ? (
            <p className="text-gray-500 text-center">Cargando permisos...</p>
          ) : permisos.length === 0 ? (
            <p className="text-gray-500 text-center">No hay permisos disponibles</p>
          ) : (
            <div className="space-y-2">
              {permisos.map((permiso) => {
                const isSelected = selectedPermisos.includes(permiso.idPermiso);
                return (
                  <label
                    key={permiso.idPermiso}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? "border-[#2B3E3C] bg-[#2B3E3C]/5" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePermiso(permiso.idPermiso)}
                      className="rounded border-gray-300 text-[#2B3E3C] focus:ring-[#2B3E3C] mr-3"
                    />
                    <span className="flex-1 font-medium text-gray-700">
                      {permiso.nombrePermiso}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-[#2B3E3C]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#2B3E3C] hover:bg-[#22312f] text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : `Guardar (${selectedPermisos.length} seleccionados)`}
          </button>
        </div>
      </div>
    </div>
  );
}

