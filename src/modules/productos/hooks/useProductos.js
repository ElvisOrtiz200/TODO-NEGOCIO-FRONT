import { useState, useEffect } from "react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productoService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useProductos = () => {
  const { organizacion } = useOrganizacion();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const idOrganizacion = organizacion?.idOrganizacion || null;
      const data = await getProductos(idOrganizacion);
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProducto = async (producto) => {
    try {
      // Agregar idOrganizacion si no está presente
      if (!producto.idOrganizacion && organizacion?.idOrganizacion) {
        producto.idOrganizacion = organizacion.idOrganizacion;
      }
      console.log("📝 Creando producto con datos:", producto);
      const nuevo = await createProducto(producto);
      console.log("✅ Producto creado exitosamente:", nuevo);
      // Recargar la lista completa para asegurar sincronización
      await loadProductos();
      return nuevo;
    } catch (err) {
      console.error("❌ Error creando producto:", err);
      throw err;
    }
  };

  const editProducto = async (idProducto, producto) => {
    try {
      console.log("✏️ Actualizando producto:", idProducto, producto);
      const actualizado = await updateProducto(idProducto, producto);
      console.log("✅ Producto actualizado exitosamente:", actualizado);
      // Recargar la lista completa para asegurar sincronización
      await loadProductos();
      return actualizado;
    } catch (err) {
      console.error("❌ Error actualizando producto:", err);
      throw err;
    }
  };

  const removeProducto = async (idProducto) => {
    try {
      console.log("🗑️ Eliminando producto:", idProducto);
      await deleteProducto(idProducto);
      // Recargar la lista completa para asegurar sincronización
      await loadProductos();
    } catch (err) {
      console.error("❌ Error eliminando producto:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (organizacion?.idOrganizacion) {
      loadProductos();
    }
  }, [organizacion?.idOrganizacion]);

  return { productos, loading, addProducto, editProducto, removeProducto, loadProductos };
};

