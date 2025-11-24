import { useState, useEffect } from "react";
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../services/proveedorService";

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      setProveedores(data);
    } catch (err) {
      console.error("Error al cargar proveedores:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProveedor = async (proveedor) => {
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
    loadProveedores();
  }, []);

  return { proveedores, loading, addProveedor, editProveedor, removeProveedor };
};
