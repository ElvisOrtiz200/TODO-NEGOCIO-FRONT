import { supabase } from "../../../api/supabaseClient";

const TABLE = "MOVIMIENTO_INVENTARIO";

export const getMovimientosInventario = async (idOrganizacion = null) => {
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      producto:PRODUCTO(*),
      tipoMovimiento:TIPOMOVIMIENTO(*),
      almacen:ALMACEN(*)
    `);
  
  // Filtrar por organización si se proporciona
  if (idOrganizacion) {
    query = query.eq("idOrganizacion", idOrganizacion);
  }
  
  const { data, error } = await query.order("fechaMovimiento", { ascending: false });
  if (error) throw error;
  return data;
};

export const createMovimientoInventario = async (movimiento) => {
  const { data, error } = await supabase.from(TABLE).insert([movimiento]).select();
  if (error) throw error;
  return data[0];
};

export const getMovimientosPorProducto = async (idProducto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      tipoMovimiento:TIPOMOVIMIENTO(*)
    `)
    .eq("idProducto", idProducto)
    .order("fechaMovimiento", { ascending: false });
  if (error) throw error;
  return data;
};

export const getMovimientosPorFecha = async (fechaInicio, fechaFin) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .gte("fechaMovimiento", fechaInicio)
    .lte("fechaMovimiento", fechaFin)
    .order("fechaMovimiento", { ascending: false });
  if (error) throw error;
  return data;
};

export const getMovimientosPorTipoMovimiento = async (idTipoMovimiento) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      producto:PRODUCTO(*),
      tipoMovimiento:TIPOMOVIMIENTO(*),
      almacen:ALMACEN(*)
    `)
    .eq("idTipoMovimiento", idTipoMovimiento)
    .order("fechaMovimiento", { ascending: false });
  if (error) throw error;
  return data;
};

