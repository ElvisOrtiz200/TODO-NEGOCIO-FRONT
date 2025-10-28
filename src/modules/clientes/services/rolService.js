import { supabase } from "../../../api/supabaseClient";


const TABLE = "ROL";


export const getRoles = async () =>{
    const { data, error } = await supabase.from(TABLE).select("*").eq("estadoRol", true).order("idRol", { ascending: true });
  if (error) throw error;
  return data;
}


export const createRol = async (rol) => {
  const { data, error } = await supabase.from(TABLE).insert([rol]).select();
  if (error) throw error;
  return data[0];
};

export const updateRol = async (idRol, rol) => {
  const { data, error } = await supabase.from(TABLE).update(rol).eq("idRol", idRol).select();
  if (error) throw error;
  return data[0];
};

export const deleteRol = async (idRol) => {
  const { error } = await supabase.from(TABLE).update({estadoRol : false }).eq("idRol", idRol);
  if (error) throw error;
};