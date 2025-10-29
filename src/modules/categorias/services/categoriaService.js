import { supabase } from "../../../api/supabaseClient";

const TABLE = "CATEGORIA";

export const getCategorias = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoCategoria", true)
    .order("idCategoria", { ascending: true });
  if (error) throw error;
  return data;
};

export const createCategoria = async (categoria) => {
  const { data, error } = await supabase.from(TABLE).insert([categoria]).select();
  if (error) throw error;
  return data[0];
};

export const updateCategoria = async (idCategoria, categoria) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(categoria)
    .eq("idCategoria", idCategoria)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteCategoria = async (idCategoria) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoCategoria: false })
    .eq("idCategoria", idCategoria);
  if (error) throw error;
};
