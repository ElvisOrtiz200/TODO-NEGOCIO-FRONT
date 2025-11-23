import { useState, useEffect } from "react";
import { getPermisos, createPermiso, updatePermiso, deletePermiso } from "../services/permisoService";

export const usePermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPermisos = async () => {
    try {
      setLoading(true);
      const data = await getPermisos();
      setPermisos(data);
    } catch (err) {
      console.error("Error al cargar permisos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPermiso = async (permiso) => {
    try {
      console.log("📝 Creando permiso con datos:", permiso);
      const nuevo = await createPermiso(permiso);
      console.log("✅ Permiso creado exitosamente:", nuevo);
      // Recargar la lista completa para asegurar sincronización
      await loadPermisos();
      return nuevo;
    } catch (err) {
      console.error("❌ Error creando permiso:", err);
      throw err;
    }
  };

  const editPermiso = async (idPermiso, permiso) => {
    try {
      console.log("✏️ Actualizando permiso:", idPermiso, permiso);
      const actualizado = await updatePermiso(idPermiso, permiso);
      console.log("✅ Permiso actualizado exitosamente:", actualizado);
      // Recargar la lista completa para asegurar sincronización
      await loadPermisos();
      return actualizado;
    } catch (err) {
      console.error("❌ Error actualizando permiso:", err);
      throw err;
    }
  };

  const removePermiso = async (idPermiso) => {
    try {
      console.log("🗑️ Eliminando permiso:", idPermiso);
      await deletePermiso(idPermiso);
      // Recargar la lista completa para asegurar sincronización
      await loadPermisos();
    } catch (err) {
      console.error("❌ Error eliminando permiso:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadPermisos();
  }, []);

  return { permisos, loading, addPermiso, editPermiso, removePermiso, loadPermisos };
};

