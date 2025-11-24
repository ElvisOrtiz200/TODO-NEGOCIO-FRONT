import { useState, useEffect } from "react";
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../services/proveedorService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useProveedores = () => {
  const { organizacion } = useOrganizacion();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const idOrganizacion = organizacion?.idOrganizacion || null;
      const data = await getProveedores(idOrganizacion);
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar proveedores:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProveedor = async (proveedor) => {
    // Agregar idOrganizacion si no está presente
    if (!proveedor.idOrganizacion && organizacion?.idOrganizacion) {
      proveedor.idOrganizacion = organizacion.idOrganizacion;
    }
    const nuevo = await createProveedor(proveedor);
    setProveedores([...proveedores, nuevo]);
  };

  const editProveedor = async (idProveedor, proveedor) => {
    const actualizado = await updateProveedor(idProveedor, proveedor);
    setProveedores(
      proveedores.map((p) =>
        p.idProveedor === idProveedor ? actualizado : p
      )
    );
  };

  const removeProveedor = async (idProveedor) => {
    await deleteProveedor(idProveedor);
    setProveedores(proveedores.filter((p) => p.idProveedor !== idProveedor));
  };

  useEffect(() => {
    if (organizacion?.idOrganizacion) {
      loadProveedores();
    }
  }, [organizacion?.idOrganizacion]);

  return { proveedores, loading, addProveedor, editProveedor, removeProveedor };
};
