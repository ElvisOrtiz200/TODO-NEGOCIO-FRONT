import { useState, useEffect } from "react";
import { getAlmacenes, createAlmacen, updateAlmacen, deleteAlmacen } from "../services/almacenService";

export const useAlmacenes = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlmacenes = async () => {
    try {
      setLoading(true);
      const data = await getAlmacenes();
      setAlmacenes(data);
    } catch (err) {
      console.error("Error al cargar almacenes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAlmacen = async (almacen) => {
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
    loadAlmacenes();
  }, []);

  return { almacenes, loading, addAlmacen, editAlmacen, removeAlmacen };
};
