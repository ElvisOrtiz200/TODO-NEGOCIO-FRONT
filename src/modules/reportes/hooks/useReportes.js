import { useState } from "react";
import {
  getVentasPorFecha,
  getComprasPorFecha,
  getProductosMasVendidos,
  getVentasPorCliente,
  getEstadisticasGenerales,
} from "../services/reporteService";

export const useReportes = () => {
  const [loading, setLoading] = useState(false);

  const obtenerVentasPorFecha = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      return await getVentasPorFecha(fechaInicio, fechaFin);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const obtenerComprasPorFecha = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      return await getComprasPorFecha(fechaInicio, fechaFin);
    } catch (error) {
      console.error("Error al obtener compras:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const obtenerProductosMasVendidos = async (fechaInicio, fechaFin, limite = 10) => {
    try {
      setLoading(true);
      return await getProductosMasVendidos(fechaInicio, fechaFin, limite);
    } catch (error) {
      console.error("Error al obtener productos más vendidos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const obtenerVentasPorCliente = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      return await getVentasPorCliente(fechaInicio, fechaFin);
    } catch (error) {
      console.error("Error al obtener ventas por cliente:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const obtenerEstadisticasGenerales = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      return await getEstadisticasGenerales(fechaInicio, fechaFin);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    obtenerVentasPorFecha,
    obtenerComprasPorFecha,
    obtenerProductosMasVendidos,
    obtenerVentasPorCliente,
    obtenerEstadisticasGenerales,
  };
};

