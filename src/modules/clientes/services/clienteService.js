import { supabase } from "../../../api/supabaseClient";

const TABLE = "CLIENTE";

export const getClientes = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoCliente", true)
    .order("idCliente", { ascending: true });
  if (error) throw error;
  return data;
};

export const createCliente = async (cliente) => {
  const { data, error } = await supabase.from(TABLE).insert([cliente]).select();
  if (error) throw error;
  return data[0];
};

export const updateCliente = async (idCliente, cliente) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(cliente)
    .eq("idCliente", idCliente)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteCliente = async (idCliente) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoCliente: false })
    .eq("idCliente", idCliente);
  if (error) throw error;
};

