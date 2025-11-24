import { useState, useEffect } from "react";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { usePermissions } from "../../../hooks/usePermissions";
import { getOrganizaciones } from "../../organizaciones/services/organizacionService";

export default function AlmacenForm({ initialData, onSubmit, onCancel }) {
  const { organizacion, usuario, loading: loadingOrg } = useOrganizacion();
  const { isSuperAdmin, roles } = usePermissions();
  const [nombreAlmacen, setNombreAlmacen] = useState("");
  const [ubicacionAlmacen, setUbicacionAlmacen] = useState("");
  const [idOrganizacion, setIdOrganizacion] = useState("");
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Determinar si debe mostrar el selector de organización
  // SOLO se muestra si es superadmin
  const debeMostrarSelector = isSuperAdmin;

  useEffect(() => {
    if (initialData) {
      setNombreAlmacen(initialData.nombreAlmacen || "");
      setUbicacionAlmacen(initialData.ubicacionAlmacen || "");
      setIdOrganizacion(initialData.idOrganizacion || "");
    } else if (!isSuperAdmin && !loadingOrg) {
      // Si no es edición y tiene organización y no es superadmin, usar automáticamente su organización
      // Intentar diferentes campos posibles
      const orgId = organizacion?.idOrganizacion || 
                    organizacion?.organizacionId || 
                    usuario?.organizacionId ||
                    usuario?.idOrganizacion;
      
      if (orgId) {
        setIdOrganizacion(orgId);
      }
    }
  }, [initialData, organizacion, usuario, isSuperAdmin, loadingOrg]);

  useEffect(() => {
    // Cargar organizaciones solo si es superadmin
    if (isSuperAdmin) {
      const loadOrganizaciones = async () => {
        try {
          setLoadingOrgs(true);
          const data = await getOrganizaciones();
          setOrganizaciones(data);
          // Si no hay idOrganizacion seleccionado y hay organizaciones, seleccionar la primera
          if (!idOrganizacion && data.length > 0) {
            setIdOrganizacion(data[0].idOrganizacion);
          }
        } catch (error) {
          console.error("Error al cargar organizaciones:", error);
        } finally {
          setLoadingOrgs(false);
        }
      };
      loadOrganizaciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Determinar el idOrganizacion a usar
    let idOrgFinal;
    
    if (isSuperAdmin) {
      // Si es superadmin, debe usar el idOrganizacion del select
      idOrgFinal = idOrganizacion;
      if (!idOrgFinal) {
        alert("Debe seleccionar una organización");
        return;
      }
    } else {
      // Si no es superadmin, usar automáticamente la organización del contexto
      // Primero intentar usar el idOrganizacion del estado (que se estableció en useEffect)
      // Si no está, usar el del contexto
      idOrgFinal = idOrganizacion || organizacion?.idOrganizacion || organizacion?.organizacionId || usuario?.organizacionId;
      
      if (!idOrgFinal) {
        console.error("No se encontró organización:", { 
          idOrganizacion, 
          organizacion, 
          usuario,
          loadingOrg 
        });
        alert("No tiene una organización asignada. Contacte al administrador.");
        return;
      }
    }

    const nuevoAlmacen = {
      nombreAlmacen,
      ubicacionAlmacen,
      estadoAlmacen: true,
      idOrganizacion: idOrgFinal,
    };

    onSubmit(nuevoAlmacen);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {debeMostrarSelector && (
        <div>
          <label className="block text-sm font-medium">Organización *</label>
          {loadingOrgs ? (
            <p className="text-sm text-gray-500">Cargando organizaciones...</p>
          ) : (
            <select
              value={idOrganizacion}
              onChange={(e) => setIdOrganizacion(e.target.value)}
              required
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Seleccione una organización</option>
              {organizaciones.map((org) => (
                <option key={org.idOrganizacion} value={org.idOrganizacion}>
                  {org.nombreOrganizacion}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      
      {!debeMostrarSelector && organizacion?.idOrganizacion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Organización:</strong> {organizacion.nombreOrganizacion || organizacion.idOrganizacion}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Nombre del Almacén</label>
        <input
          type="text"
          value={nombreAlmacen}
          onChange={(e) => setNombreAlmacen(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Ubicación del Almacén</label>
        <input
          type="text"
          value={ubicacionAlmacen}
          onChange={(e) => setUbicacionAlmacen(e.target.value)}
          required
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f]"
        >
          {initialData ? "Actualizar" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
