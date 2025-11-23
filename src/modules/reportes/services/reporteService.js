import { supabase } from "../../../api/supabaseClient";

export const getVentasPorFecha = async (fechaInicio, fechaFin) => {
  const { data, error } = await supabase
    .from("VENTA")
    .select("*")
    .gte("fechaVenta", fechaInicio)
    .lte("fechaVenta", fechaFin)
    .eq("estadoVenta", "COMPLETADA");
  if (error) throw error;
  return data;
};

export const getComprasPorFecha = async (fechaInicio, fechaFin) => {
  const { data, error } = await supabase
    .from("COMPRA")
    .select("*")
    .gte("fechaCompra", fechaInicio)
    .lte("fechaCompra", fechaFin)
    .eq("estadoCompra", "COMPLETADA");
  if (error) throw error;
  return data;
};

export const getProductosMasVendidos = async (fechaInicio, fechaFin, limite = 10) => {
  const { data, error } = await supabase
    .from("VENTA_DETALLE")
    .select(`
      *,
      venta:VENTA!inner(*)
    `)
    .gte("venta.fechaVenta", fechaInicio)
    .lte("venta.fechaVenta", fechaFin)
    .eq("venta.estadoVenta", "COMPLETADA");
  
  if (error) throw error;

  // Agrupar por producto y sumar cantidades
  const productosMap = {};
  data.forEach((detalle) => {
    const idProducto = detalle.idProducto;
    if (!productosMap[idProducto]) {
      productosMap[idProducto] = {
        idProducto,
        cantidad: 0,
        total: 0,
      };
    }
    productosMap[idProducto].cantidad += detalle.cantidad;
    productosMap[idProducto].total += detalle.subtotal;
  });

  // Obtener información de productos
  const productosIds = Object.keys(productosMap);
  const { data: productos, error: productosError } = await supabase
    .from("PRODUCTO")
    .select("idProducto, nombreProducto")
    .in("idProducto", productosIds);

  if (productosError) throw productosError;

  // Combinar datos
  const productosMasVendidos = productos
    .map((producto) => ({
      ...producto,
      ...productosMap[producto.idProducto],
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, limite);

  return productosMasVendidos;
};

export const getVentasPorCliente = async (fechaInicio, fechaFin) => {
  const { data, error } = await supabase
    .from("VENTA")
    .select(`
      *,
      cliente:CLIENTE(*)
    `)
    .gte("fechaVenta", fechaInicio)
    .lte("fechaVenta", fechaFin)
    .eq("estadoVenta", "COMPLETADA")
    .not("idCliente", "is", null);
  
  if (error) throw error;

  // Agrupar por cliente
  const clientesMap = {};
  data.forEach((venta) => {
    const idCliente = venta.idCliente;
    if (!clientesMap[idCliente]) {
      clientesMap[idCliente] = {
        cliente: venta.cliente,
        total: 0,
        cantidadVentas: 0,
      };
    }
    clientesMap[idCliente].total += venta.totalVenta;
    clientesMap[idCliente].cantidadVentas += 1;
  });

  return Object.values(clientesMap).sort((a, b) => b.total - a.total);
};

export const getEstadisticasGenerales = async (fechaInicio, fechaFin) => {
  const [ventas, compras] = await Promise.all([
    getVentasPorFecha(fechaInicio, fechaFin),
    getComprasPorFecha(fechaInicio, fechaFin),
  ]);

  const totalVentas = ventas.reduce((sum, v) => sum + (v.totalVenta || 0), 0);
  const totalCompras = compras.reduce((sum, c) => sum + (c.totalCompra || 0), 0);
  const utilidad = totalVentas - totalCompras;
  const cantidadVentas = ventas.length;
  const cantidadCompras = compras.length;

  return {
    totalVentas,
    totalCompras,
    utilidad,
    cantidadVentas,
    cantidadCompras,
    margenGanancia: totalVentas > 0 ? ((utilidad / totalVentas) * 100).toFixed(2) : 0,
  };
};

