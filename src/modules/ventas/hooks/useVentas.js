import { useState, useEffect } from "react";
import {
  getVentas,
  createVenta,
  updateVenta,
  deleteVenta,
  getVentaById,
  createVentaDetalle,
} from "../services/ventaService";

export const useVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVentas = async () => {
    try {
      setLoading(true);
      const data = await getVentas();
      setVentas(data);
    } catch (err) {
      console.error("Error al cargar ventas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addVenta = async (venta, detalles) => {
    // Crear la venta principal
    const nuevaVenta = await createVenta(venta);
    
    // Crear los detalles de la venta
    const detallesCreados = await Promise.all(
      detalles.map((detalle) =>
        createVentaDetalle({
          ...detalle,
          idVenta: nuevaVenta.idVenta,
        })
      )
    );

    return { venta: nuevaVenta, detalles: detallesCreados };
  };

  const editVenta = async (idVenta, venta) => {
    const actualizada = await updateVenta(idVenta, venta);
    setVentas(ventas.map((v) => (v.idVenta === idVenta ? actualizada : v)));
    return actualizada;
  };

  const removeVenta = async (idVenta) => {
    await deleteVenta(idVenta);
    setVentas(ventas.filter((v) => v.idVenta !== idVenta));
  };

  const getVenta = async (idVenta) => {
    return await getVentaById(idVenta);
  };

  useEffect(() => {
    loadVentas();
  }, []);

  return {
    ventas,
    loading,
    addVenta,
    editVenta,
    removeVenta,
    getVenta,
    loadVentas,
  };
};

