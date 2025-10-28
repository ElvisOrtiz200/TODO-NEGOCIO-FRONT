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
      setRoles(data);
    } catch (err) {
      console.error("Error al cargar roles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRol = async (rol) => {
    const nuevo = await createRol(rol);
    setRoles([...roles, nuevo]);
  };

  const editRol = async (idRol, rol) => {
    const actualizado = await updateRol(idRol, rol);
    setRoles(roles.map((r) => (r.idRol === idRol ? actualizado : r)));
  };

  const removeRol = async (idRol) => {
    await deleteRol(idRol);
    setRoles(roles.filter((r) => r.idRol !== idRol));
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return { roles, loading, addRol, editRol, removeRol };
};
