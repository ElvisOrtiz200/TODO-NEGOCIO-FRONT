import { useState, useEffect } from "react";
import {
  getCompras,
  createCompra,
  updateCompra,
  deleteCompra,
  getCompraById,
  createCompraDetalle,
} from "../services/compraService";

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCompras = async () => {
    try {
      setLoading(true);
      const data = await getCompras();
      setCompras(data);
    } catch (err) {
      console.error("Error al cargar compras:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCompra = async (compra, detalles) => {
    // Crear la compra principal
    const nuevaCompra = await createCompra(compra);
    
    // Crear los detalles de la compra
    const detallesCreados = await Promise.all(
      detalles.map((detalle) =>
        createCompraDetalle({
          ...detalle,
          idCompra: nuevaCompra.idCompra,
        })
      )
    );

    return { compra: nuevaCompra, detalles: detallesCreados };
  };

  const editCompra = async (idCompra, compra) => {
    const actualizada = await updateCompra(idCompra, compra);
    setCompras(compras.map((c) => (c.idCompra === idCompra ? actualizada : c)));
    return actualizada;
  };

  const removeCompra = async (idCompra) => {
    await deleteCompra(idCompra);
    setCompras(compras.filter((c) => c.idCompra !== idCompra));
  };

  const getCompra = async (idCompra) => {
    return await getCompraById(idCompra);
  };

  useEffect(() => {
    loadCompras();
  }, []);

  return {
    compras,
    loading,
    addCompra,
    editCompra,
    removeCompra,
    getCompra,
    loadCompras,
  };
};

