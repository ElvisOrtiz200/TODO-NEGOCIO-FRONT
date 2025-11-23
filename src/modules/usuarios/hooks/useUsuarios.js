import { useState, useEffect } from "react";
import {
  getUsuarios,
  getUsuarioById,
  getUsuarioByAuthId,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  buscarUsuarioPorEmail,
} from "../services/usuarioService";

export const useUsuarios = (organizacionId = null) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuarios(organizacionId);
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
      console.error("Error al cargar usuarios:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addUsuario = async (usuario) => {
    try {
      setError(null);
      const nuevo = await createUsuario(usuario);
      setUsuarios([...usuarios, nuevo]);
      return { success: true, data: nuevo };
    } catch (err) {
      setError(err.message);
      console.error("Error al crear usuario:", err.message);
      return { success: false, error: err.message };
    }
  };

  const editUsuario = async (idUsuario, usuario) => {
    try {
      setError(null);
      const actualizado = await updateUsuario(idUsuario, usuario);
      setUsuarios(
        usuarios.map((u) =>
          u.idUsuario === idUsuario ? actualizado : u
        )
      );
      return { success: true, data: actualizado };
    } catch (err) {
      setError(err.message);
      console.error("Error al actualizar usuario:", err.message);
      return { success: false, error: err.message };
    }
  };

  const removeUsuario = async (idUsuario) => {
    try {
      setError(null);
      await deleteUsuario(idUsuario);
      setUsuarios(usuarios.filter((u) => u.idUsuario !== idUsuario));
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error("Error al eliminar usuario:", err.message);
      return { success: false, error: err.message };
    }
  };

  const buscarPorEmail = async (email) => {
    try {
      const resultados = await buscarUsuarioPorEmail(email);
      return resultados;
    } catch (err) {
      console.error("Error al buscar usuario por email:", err.message);
      return [];
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [organizacionId]);

  return {
    usuarios,
    loading,
    error,
    addUsuario,
    editUsuario,
    removeUsuario,
    buscarPorEmail,
    reload: loadUsuarios,
  };
};

