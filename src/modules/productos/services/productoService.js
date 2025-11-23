import { supabase } from "../../../api/supabaseClient";

const TABLE = "PRODUCTO";

export const getProductos = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoProducto", true)
    .order("idProducto", { ascending: true });
  if (error) throw error;
  return data;
};

export const createProducto = async (producto) => {
  const { data, error } = await supabase.from(TABLE).insert([producto]).select();
  if (error) throw error;
  return data[0];
};

export const updateProducto = async (idProducto, producto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(producto)
    .eq("idProducto", idProducto)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteProducto = async (idProducto) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoProducto: false })
    .eq("idProducto", idProducto);
  if (error) throw error;
};

export const getProductoById = async (idProducto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idProducto", idProducto)
    .single();
  if (error) throw error;
  return data;
};

