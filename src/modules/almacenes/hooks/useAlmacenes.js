import { useState, useEffect } from "react";
import { getAlmacenes, createAlmacen, updateAlmacen, deleteAlmacen } from "../services/almacenService";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { usePermissions } from "../../../hooks/usePermissions";

export const useAlmacenes = () => {
  const { organizacion, organizacionVista } = useOrganizacion();
  const { isSuperAdmin } = usePermissions();
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlmacenes = async (includeOrganizacion = null) => {
    try {
      setLoading(true);
      const orgActiva = organizacionVista || organizacion;
      const idOrganizacion = orgActiva?.idOrganizacion || null;
      // Si includeOrganizacion es null, usar isSuperAdmin para decidir (solo si no está viendo una organización)
      const estaViendoOrg = organizacionVista !== null;
      const shouldIncludeOrg = includeOrganizacion !== null ? includeOrganizacion : (isSuperAdmin && !estaViendoOrg);
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
    const orgActiva = organizacionVista || organizacion;
    if (!almacen.idOrganizacion && orgActiva?.idOrganizacion) {
      almacen.idOrganizacion = orgActiva.idOrganizacion;
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
    // Cargar almacenes si hay organización activa (organizacionVista o organizacion)
    const orgActiva = organizacionVista || organizacion;
    if (orgActiva?.idOrganizacion || (isSuperAdmin && !organizacionVista)) {
      loadAlmacenes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizacion?.idOrganizacion, organizacionVista?.idOrganizacion, isSuperAdmin]);

  return { almacenes, loading, addAlmacen, editAlmacen, removeAlmacen, loadAlmacenes };
};
