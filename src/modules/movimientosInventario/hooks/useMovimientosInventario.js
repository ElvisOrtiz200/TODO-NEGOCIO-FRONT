import { useState, useEffect } from "react";
import {
  getMovimientosInventario,
  createMovimientoInventario,
  getMovimientosPorProducto,
  getMovimientosPorFecha,
} from "../services/movimientoInventarioService";
import { actualizarStock } from "../../inventario/services/inventarioService";
import { supabase } from "../../../api/supabaseClient";

export const useMovimientosInventario = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await getMovimientosInventario();
      setMovimientos(data);
    } catch (err) {
      console.error("Error al cargar movimientos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMovimiento = async (movimiento) => {
    try {
      // Calcular nuevo stock según el tipo de movimiento
      const { data: producto } = await supabase
        .from("PRODUCTO")
        .select("stockActual")
        .eq("idProducto", movimiento.idProducto)
        .single();

      let nuevoStock = producto.stockActual || 0;

      // Obtener naturaleza del tipo de movimiento
      const { data: tipoMov } = await supabase
        .from("TIPOMOVIMIENTO")
        .select("naturaleza")
        .eq("idTipoMovimiento", movimiento.idTipoMovimiento)
        .single();

      if (tipoMov.naturaleza === "Entrada") {
        nuevoStock += movimiento.cantidad;
      } else if (tipoMov.naturaleza === "Salida") {
        nuevoStock -= movimiento.cantidad;
      }

      // Crear el movimiento
      const nuevoMovimiento = await createMovimientoInventario({
        ...movimiento,
        stockAnterior: producto.stockActual || 0,
        stockNuevo: nuevoStock,
        fechaMovimiento: new Date().toISOString(),
      });

      // Actualizar stock del producto
      await actualizarStock(movimiento.idProducto, nuevoStock);

      setMovimientos([nuevoMovimiento, ...movimientos]);
      return nuevoMovimiento;
    } catch (error) {
      console.error("Error al crear movimiento:", error);
      throw error;
    }
  };

  const getMovimientosProducto = async (idProducto) => {
    return await getMovimientosPorProducto(idProducto);
  };

  const getMovimientosFecha = async (fechaInicio, fechaFin) => {
    return await getMovimientosPorFecha(fechaInicio, fechaFin);
  };

  useEffect(() => {
    loadMovimientos();
  }, []);

  return {
    movimientos,
    loading,
    addMovimiento,
    getMovimientosProducto,
    getMovimientosFecha,
    loadMovimientos,
  };
};

