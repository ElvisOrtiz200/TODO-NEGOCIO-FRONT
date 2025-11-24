import { supabase } from "../../../api/supabaseClient";

const TABLE = "ALMACEN";

export const getAlmacenes = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoAlmacen", true)
    .order("idAlmacen", { ascending: true });
  if (error) throw error;
  return data;
};

export const createAlmacen = async (almacen) => {
  const { data, error } = await supabase.from(TABLE).insert([almacen]).select();
  if (error) throw error;
  return data[0];
};

export const updateAlmacen = async (idAlmacen, almacen) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(almacen)
    .eq("idAlmacen", idAlmacen)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteAlmacen = async (idAlmacen) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoAlmacen: false })
    .eq("idAlmacen", idAlmacen);
  if (error) throw error;
};
