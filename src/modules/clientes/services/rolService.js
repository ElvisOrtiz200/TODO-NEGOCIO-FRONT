import { supabase } from "../../../api/supabaseClient";

const TABLE = "ROL";

export const getRoles = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoRol", true)
    .order("idRol", { ascending: true });
  if (error) throw error;
  return data;
};


export const createRol = async (rol) => {
  const rolData = {
    ...rol,
    fechaRegistroRol: new Date().toISOString(),
    estadoRol: true,
  };
  const { data, error } = await supabase.from(TABLE).insert([rolData]).select();
  if (error) throw error;
  return data[0];
};

export const getRolById = async (idRol) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idRol", idRol)
    .single();
  if (error) throw error;
  return data;
};

export const updateRol = async (idRol, rol) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(rol)
    .eq("idRol", idRol)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteRol = async (idRol) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoRol: false })
    .eq("idRol", idRol);
  if (error) throw error;
};