import { supabase } from "../../../api/supabaseClient";

const TABLE = "UNIDADMEDIDA";

export const getUnidadesMedida = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("nombreUnidadMedida", { ascending: true });

  if (error) throw error;
  return data;
};

export const createUnidadMedida = async (unidadMedida) => {
  const { data, error } = await supabase.from(TABLE).insert([unidadMedida]).select();
  if (error) throw error;
  return data[0];
};

export const updateUnidadMedida = async (idUnidadMedida, unidadMedida) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(unidadMedida)
    .eq("idUnidadMedida", idUnidadMedida)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteUnidadMedida = async (idUnidadMedida) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("idUnidadMedida", idUnidadMedida);
  if (error) throw error;
};

