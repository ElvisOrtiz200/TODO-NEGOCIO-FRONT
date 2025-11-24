import { supabase } from "../../../api/supabaseClient";

const TABLE = "COMPRA";
const TABLE_DETALLE = "COMPRA_DETALLE";

export const getCompras = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      proveedor:PROVEEDOR(*)
    `)
    .order("fechaCompra", { ascending: false });
  if (error) throw error;
  return data;
};

export const getCompraById = async (idCompra) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      proveedor:PROVEEDOR(*),
      detalles:COMPRA_DETALLE(*, producto:PRODUCTO(*))
    `)
    .eq("idCompra", idCompra)
    .single();
  if (error) throw error;
  return data;
};

export const createCompra = async (compra) => {
  const { data, error } = await supabase.from(TABLE).insert([compra]).select();
  if (error) throw error;
  return data[0];
};

export const createCompraDetalle = async (detalle) => {
  const { data, error } = await supabase.from(TABLE_DETALLE).insert([detalle]).select();
  if (error) throw error;
  return data[0];
};

export const updateCompra = async (idCompra, compra) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(compra)
    .eq("idCompra", idCompra)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteCompra = async (idCompra) => {
  // Primero eliminar detalles
  await supabase.from(TABLE_DETALLE).delete().eq("idCompra", idCompra);
  // Luego eliminar compra
  const { error } = await supabase.from(TABLE).delete().eq("idCompra", idCompra);
  if (error) throw error;
};

