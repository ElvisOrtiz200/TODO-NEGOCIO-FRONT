import { useState, useEffect } from "react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productoService";

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProducto = async (producto) => {
    const nuevo = await createProducto(producto);
    setProductos([...productos, nuevo]);
  };

  const editProducto = async (idProducto, producto) => {
    const actualizado = await updateProducto(idProducto, producto);
    setProductos(
      productos.map((p) =>
        p.idProducto === idProducto ? actualizado : p
      )
    );
  };

  const removeProducto = async (idProducto) => {
    await deleteProducto(idProducto);
    setProductos(productos.filter((p) => p.idProducto !== idProducto));
  };

  useEffect(() => {
    loadProductos();
  }, []);

  return { productos, loading, addProducto, editProducto, removeProducto, loadProductos };
};

