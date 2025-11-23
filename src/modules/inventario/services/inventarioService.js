import { supabase } from "../../../api/supabaseClient";

const TABLE = "PRODUCTO";

export const getInventario = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      categoria:CATEGORIA(*),
      almacen:ALMACEN(*)
    `)
    .eq("estadoProducto", true)
    .order("nombreProducto", { ascending: true });
  if (error) throw error;
  return data;
};

export const getProductosBajoStock = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoProducto", true)
    .order("stockActual", { ascending: true });
  if (error) throw error;
  // Filtrar productos donde stockActual <= stockMinimo
  return data.filter((p) => p.stockActual <= p.stockMinimo);
};

export const actualizarStock = async (idProducto, nuevoStock) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ stockActual: nuevoStock })
    .eq("idProducto", idProducto)
    .select();
  if (error) throw error;
  return data[0];
};

export const getProductoPorCodigoBarras = async (codigoBarras) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("codigoBarras", codigoBarras)
    .eq("estadoProducto", true)
    .single();
  if (error) throw error;
  return data;
};

