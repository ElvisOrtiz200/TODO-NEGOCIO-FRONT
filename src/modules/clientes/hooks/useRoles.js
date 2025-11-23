// src/modules/roles/hooks/useRoles.js
import { useState, useEffect } from "react";
import { getRoles, createRol, updateRol, deleteRol } from "../services/rolService";

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error("Error al cargar roles:", err);
      setRoles([]);
      alert(`Error al cargar roles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addRol = async (rol) => {
    const nuevo = await createRol(rol);
    await loadRoles(); // Recargar la lista completa
    return nuevo;
  };

  const editRol = async (idRol, rol) => {
    const actualizado = await updateRol(idRol, rol);
    await loadRoles(); // Recargar la lista completa
    return actualizado;
  };

  const removeRol = async (idRol) => {
    await deleteRol(idRol);
    await loadRoles(); // Recargar la lista completa
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return { roles, loading, addRol, editRol, removeRol, loadRoles };
};
