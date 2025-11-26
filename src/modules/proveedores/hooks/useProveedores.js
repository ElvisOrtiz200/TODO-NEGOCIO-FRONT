import { useState, useEffect } from "react";
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../services/proveedorService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useProveedores = () => {
  const { organizacion, organizacionVista } = useOrganizacion();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const orgActiva = organizacionVista || organizacion;
      const idOrganizacion = orgActiva?.idOrganizacion || null;
      const data = await getProveedores(idOrganizacion);
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar proveedores:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProveedor = async (proveedor) => {
    try {
      // Agregar idOrganizacion si no está presente
      const orgActiva = organizacionVista || organizacion;
      if (!proveedor.idOrganizacion && orgActiva?.idOrganizacion) {
        proveedor.idOrganizacion = orgActiva.idOrganizacion;
      }
      console.log("📝 Creando proveedor con datos:", proveedor);
      const nuevo = await createProveedor(proveedor);
      console.log("✅ Proveedor creado exitosamente:", nuevo);
      // Recargar la lista completa para asegurar sincronización
      await loadProveedores();
      return nuevo;
    } catch (err) {
      console.error("❌ Error creando proveedor:", err);
      throw err;
    }
  };

  const editProveedor = async (idProveedor, proveedor) => {
    try {
      // Asegurar que idOrganizacion esté presente para validaciones
      const orgActiva = organizacionVista || organizacion;
      if (!proveedor.idOrganizacion && orgActiva?.idOrganizacion) {
        proveedor.idOrganizacion = orgActiva.idOrganizacion;
      }
      console.log("✏️ Actualizando proveedor:", idProveedor, proveedor);
      const actualizado = await updateProveedor(idProveedor, proveedor);
      console.log("✅ Proveedor actualizado exitosamente:", actualizado);
      // Recargar la lista completa para asegurar sincronización
      await loadProveedores();
      return actualizado;
    } catch (err) {
      console.error("❌ Error actualizando proveedor:", err);
      throw err;
    }
  };

  const removeProveedor = async (idProveedor) => {
    try {
      console.log("🗑️ Eliminando proveedor:", idProveedor);
      await deleteProveedor(idProveedor);
      // Recargar la lista completa para asegurar sincronización
      await loadProveedores();
    } catch (err) {
      console.error("❌ Error eliminando proveedor:", err);
      throw err;
    }
  };

  useEffect(() => {
    const orgActiva = organizacionVista || organizacion;
    if (orgActiva?.idOrganizacion) {
      loadProveedores();
    }
  }, [organizacion?.idOrganizacion, organizacionVista?.idOrganizacion]);

  return { proveedores, loading, addProveedor, editProveedor, removeProveedor, loadProveedores };
};
