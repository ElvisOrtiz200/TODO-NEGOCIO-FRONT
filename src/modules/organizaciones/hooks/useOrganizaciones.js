import { useState, useEffect } from "react";
import {
  getOrganizaciones,
  getOrganizacionById,
  createOrganizacion,
  updateOrganizacion,
  deleteOrganizacion,
  getUsuariosOrganizacion,
} from "../services/organizacionService";

export const useOrganizaciones = () => {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrganizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganizaciones();
      setOrganizaciones(data);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar organizaciones:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addOrganizacion = async (organizacion) => {
    try {
      setError(null);
      const nueva = await createOrganizacion(organizacion);
      setOrganizaciones([...organizaciones, nueva]);
      return { success: true, data: nueva };
    } catch (err) {
      setError(err.message);
      console.error("Error al crear organización:", err.message);
      return { success: false, error: err.message };
    }
  };

  const editOrganizacion = async (idOrganizacion, organizacion) => {
    try {
      setError(null);
      const actualizada = await updateOrganizacion(idOrganizacion, organizacion);
      setOrganizaciones(
        organizaciones.map((o) =>
          o.idOrganizacion === idOrganizacion ? actualizada : o
        )
      );
      return { success: true, data: actualizada };
    } catch (err) {
      setError(err.message);
      console.error("Error al actualizar organización:", err.message);
      return { success: false, error: err.message };
    }
  };

  const removeOrganizacion = async (idOrganizacion) => {
    try {
      setError(null);
      await deleteOrganizacion(idOrganizacion);
      setOrganizaciones(
        organizaciones.filter((o) => o.idOrganizacion !== idOrganizacion)
      );
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error("Error al eliminar organización:", err.message);
      return { success: false, error: err.message };
    }
  };

  const loadUsuariosOrganizacion = async (idOrganizacion) => {
    try {
      const usuarios = await getUsuariosOrganizacion(idOrganizacion);
      return usuarios;
    } catch (err) {
      console.error("Error al cargar usuarios de la organización:", err.message);
      return [];
    }
  };

  useEffect(() => {
    loadOrganizaciones();
  }, []);

  return {
    organizaciones,
    loading,
    error,
    addOrganizacion,
    editOrganizacion,
    removeOrganizacion,
    loadUsuariosOrganizacion,
    reloadOrganizaciones: loadOrganizaciones,
  };
};

