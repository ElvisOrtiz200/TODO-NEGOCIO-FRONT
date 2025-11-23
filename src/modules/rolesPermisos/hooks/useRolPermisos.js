import { useState, useEffect } from "react";
import {
  getPermisosByRol,
  asignarPermisoARol,
  removerPermisoDeRol,
  asignarPermisosARol,
} from "../services/rolPermisoService";

export const useRolPermisos = (idRol) => {
  const [permisosRol, setPermisosRol] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPermisosRol = async () => {
    if (!idRol) return;
    try {
      setLoading(true);
      const data = await getPermisosByRol(idRol);
      setPermisosRol(data);
    } catch (err) {
      console.error("Error al cargar permisos del rol:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarPermiso = async (idPermiso) => {
    try {
      await asignarPermisoARol(idRol, idPermiso);
      await loadPermisosRol();
    } catch (error) {
      console.error("Error al asignar permiso:", error);
      throw error;
    }
  };

  const eliminarPermiso = async (idPermiso) => {
    try {
      await removerPermisoDeRol(idRol, idPermiso);
      await loadPermisosRol();
    } catch (error) {
      console.error("Error al remover permiso:", error);
      throw error;
    }
  };

  const actualizarPermisos = async (idsPermisos) => {
    try {
      await asignarPermisosARol(idRol, idsPermisos);
      await loadPermisosRol();
    } catch (error) {
      console.error("Error al actualizar permisos:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadPermisosRol();
  }, [idRol]);

  return {
    permisosRol,
    loading,
    agregarPermiso,
    eliminarPermiso,
    actualizarPermisos,
    loadPermisosRol,
  };
};

