import { useState, useEffect } from "react";
import { getAlmacenes, createAlmacen, updateAlmacen, deleteAlmacen } from "../services/almacenService";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { usePermissions } from "../../../hooks/usePermissions";

export const useAlmacenes = () => {
  const { organizacion } = useOrganizacion();
  const { isSuperAdmin } = usePermissions();
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlmacenes = async (includeOrganizacion = null) => {
    try {
      setLoading(true);
      const idOrganizacion = organizacion?.idOrganizacion || null;
      // Si includeOrganizacion es null, usar isSuperAdmin para decidir
      const shouldIncludeOrg = includeOrganizacion !== null ? includeOrganizacion : isSuperAdmin;
      const data = await getAlmacenes(idOrganizacion, shouldIncludeOrg);
      setAlmacenes(data);
    } catch (err) {
      console.error("Error al cargar almacenes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAlmacen = async (almacen) => {
    // Agregar idOrganizacion si no está presente y hay organización en el contexto
    if (!almacen.idOrganizacion && organizacion?.idOrganizacion) {
      almacen.idOrganizacion = organizacion.idOrganizacion;
    }
    // Validar que tenga idOrganizacion
    if (!almacen.idOrganizacion) {
      throw new Error("El almacén debe tener una organización asignada");
    }
    const nuevo = await createAlmacen(almacen);
    setAlmacenes([...almacenes, nuevo]);
  };

  const editAlmacen = async (idAlmacen, almacen) => {
    const actualizado = await updateAlmacen(idAlmacen, almacen);
    setAlmacenes(almacenes.map((a) => (a.idAlmacen === idAlmacen ? actualizado : a)));
  };

  const removeAlmacen = async (idAlmacen) => {
    await deleteAlmacen(idAlmacen);
    setAlmacenes(almacenes.filter((a) => a.idAlmacen !== idAlmacen));
  };

  useEffect(() => {
    // Cargar almacenes si hay organización o si es superadmin (carga todos)
    if (organizacion?.idOrganizacion || !organizacion || isSuperAdmin) {
      loadAlmacenes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizacion?.idOrganizacion, isSuperAdmin]);

  return { almacenes, loading, addAlmacen, editAlmacen, removeAlmacen, loadAlmacenes };
};
