import { useState, useEffect } from "react";
import * as rolService from "../services/rolService";

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rolService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const addRol = async (rol) => {
    try {
      const nuevoRol = await rolService.createRol(rol);
      // Recargar la lista completa para asegurar sincronización
      await loadRoles();
      return { success: true, data: nuevoRol };
    } catch (err) {
      console.error("Error creando rol:", err);
      const errorMsg = err?.message || err?.toString() || "Error desconocido al crear el rol";
      return { success: false, error: errorMsg };
    }
  };

  const editRol = async (idRol, rol) => {
    try {
      const rolActualizado = await rolService.updateRol(idRol, rol);
      // Recargar la lista completa para asegurar sincronización
      await loadRoles();
      return { success: true, data: rolActualizado };
    } catch (err) {
      console.error("Error actualizando rol:", err);
      const errorMsg = err?.message || err?.toString() || "Error desconocido al actualizar el rol";
      return { success: false, error: errorMsg };
    }
  };

  const removeRol = async (idRol) => {
    try {
      await rolService.deleteRol(idRol);
      setRoles(roles.filter((r) => r.idRol !== idRol));
      return { success: true };
    } catch (err) {
      console.error("Error eliminando rol:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    roles,
    loading,
    error,
    addRol,
    editRol,
    removeRol,
    reloadRoles: loadRoles,
  };
};

