import { useState, useEffect } from "react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../services/productoService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useProductos = () => {
  const { organizacion, organizacionVista } = useOrganizacion();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProductos = async () => {
    try {
      setLoading(true);
      // Usar organizacionVista si existe, sino usar organizacion
      const orgActiva = organizacionVista || organizacion;
      const idOrganizacion = orgActiva?.idOrganizacion || null;
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
      const orgActiva = organizacionVista || organizacion;
      if (!producto.idOrganizacion && orgActiva?.idOrganizacion) {
        producto.idOrganizacion = orgActiva.idOrganizacion;
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
      // Asegurar que idOrganizacion esté presente para validaciones
      const orgActiva = organizacionVista || organizacion;
      if (!producto.idOrganizacion && orgActiva?.idOrganizacion) {
        producto.idOrganizacion = orgActiva.idOrganizacion;
      }
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
    const orgActiva = organizacionVista || organizacion;
    if (orgActiva?.idOrganizacion) {
      loadProductos();
    }
  }, [organizacion?.idOrganizacion, organizacionVista?.idOrganizacion]);

  return { productos, loading, addProducto, editProducto, removeProducto, loadProductos };
};

