import { useState, useEffect } from "react";
import {
  getTipoMovimientos,
  createTipoMovimiento,
  updateTipoMovimiento,
  deleteTipoMovimiento,
} from "../services/tipoMovimientoService";

export const useTipoMovimientos = () => {
  const [tipoMovimientos, setTipoMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTipoMovimientos = async () => {
    try {
      setLoading(true);
      const data = await getTipoMovimientos();
      setTipoMovimientos(data);
    } catch (err) {
      console.error("Error al cargar tipos de movimiento:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTipoMovimiento = async (tipoMovimiento) => {
    const nuevo = await createTipoMovimiento(tipoMovimiento);
    setTipoMovimientos([...tipoMovimientos, nuevo]);
  };

  const editTipoMovimiento = async (idTipoMovimiento, tipoMovimiento) => {
    const actualizado = await updateTipoMovimiento(idTipoMovimiento, tipoMovimiento);
    setTipoMovimientos(
      tipoMovimientos.map((t) =>
        t.idTipoMovimiento === idTipoMovimiento ? actualizado : t
      )
    );
  };

  const removeTipoMovimiento = async (idTipoMovimiento) => {
    await deleteTipoMovimiento(idTipoMovimiento);
    setTipoMovimientos(
      tipoMovimientos.filter((t) => t.idTipoMovimiento !== idTipoMovimiento)
    );
  };

  useEffect(() => {
    loadTipoMovimientos();
  }, []);

  return {
    tipoMovimientos,
    loading,
    addTipoMovimiento,
    editTipoMovimiento,
    removeTipoMovimiento,
  };
};
