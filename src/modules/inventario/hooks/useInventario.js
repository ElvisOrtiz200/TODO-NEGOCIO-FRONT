import { useState, useEffect } from "react";
import {
  getInventario,
  getProductosBajoStock,
  actualizarStock,
  getProductoPorCodigoBarras,
} from "../services/inventarioService";

export const useInventario = () => {
  const [inventario, setInventario] = useState([]);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventario = async () => {
    try {
      setLoading(true);
      const data = await getInventario();
      setInventario(data);
      const bajoStock = await getProductosBajoStock();
      setProductosBajoStock(bajoStock);
    } catch (err) {
      console.error("Error al cargar inventario:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (idProducto, nuevoStock) => {
    try {
      const actualizado = await actualizarStock(idProducto, nuevoStock);
      setInventario(
        inventario.map((p) =>
          p.idProducto === idProducto ? actualizado : p
        )
      );
      await loadInventario(); // Recargar para actualizar productos bajo stock
      return actualizado;
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      throw error;
    }
  };

  const buscarPorCodigoBarras = async (codigoBarras) => {
    try {
      return await getProductoPorCodigoBarras(codigoBarras);
    } catch (error) {
      console.error("Error al buscar producto:", error);
      return null;
    }
  };

  useEffect(() => {
    loadInventario();
  }, []);

  return {
    inventario,
    productosBajoStock,
    loading,
    loadInventario,
    updateStock,
    buscarPorCodigoBarras,
  };
};

