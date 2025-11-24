import { supabase } from "../../../api/supabaseClient";

const TABLE = "VENTA";
const TABLE_DETALLE = "VENTA_DETALLE";

export const getVentas = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      cliente:CLIENTE(*),
      usuario:USUARIO(*)
    `)
    .order("fechaVenta", { ascending: false });
  if (error) throw error;
  return data;
};

export const getVentaById = async (idVenta) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      cliente:CLIENTE(*),
      usuario:USUARIO(*),
      detalles:VENTA_DETALLE(*, producto:PRODUCTO(*))
    `)
    .eq("idVenta", idVenta)
    .single();
  if (error) throw error;
  return data;
};

export const createVenta = async (venta) => {
  const { data, error } = await supabase.from(TABLE).insert([venta]).select();
  if (error) throw error;
  return data[0];
};

export const createVentaDetalle = async (detalle) => {
  const { data, error } = await supabase.from(TABLE_DETALLE).insert([detalle]).select();
  if (error) throw error;
  return data[0];
};

export const updateVenta = async (idVenta, venta) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(venta)
    .eq("idVenta", idVenta)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteVenta = async (idVenta) => {
  // Primero eliminar detalles
  await supabase.from(TABLE_DETALLE).delete().eq("idVenta", idVenta);
  // Luego eliminar venta
  const { error } = await supabase.from(TABLE).delete().eq("idVenta", idVenta);
  if (error) throw error;
};

export const getVentasPorFecha = async (fechaInicio, fechaFin) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .gte("fechaVenta", fechaInicio)
    .lte("fechaVenta", fechaFin)
    .order("fechaVenta", { ascending: false });
  if (error) throw error;
  return data;
};

