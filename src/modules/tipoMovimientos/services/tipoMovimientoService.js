import { supabase } from "../../../api/supabaseClient";

const TABLE = "TIPOMOVIMIENTOS";

export const getTipoMovimientos = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoTipoMovimiento", true)
    .order("idTipoMovimiento", { ascending: true });
  if (error) throw error;
  return data;
};

export const createTipoMovimiento = async (tipoMovimiento) => {
  const { data, error } = await supabase.from(TABLE).insert([tipoMovimiento]).select();
  if (error) throw error;
  return data[0];
};

export const updateTipoMovimiento = async (idTipoMovimiento, tipoMovimiento) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(tipoMovimiento)
    .eq("idTipoMovimiento", idTipoMovimiento)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteTipoMovimiento = async (idTipoMovimiento) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoMovimiento: false })
    .eq("idTipoMovimiento", idTipoMovimiento);
  if (error) throw error;
};
