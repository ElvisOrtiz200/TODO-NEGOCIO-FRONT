import { supabase } from "../../../api/supabaseClient";

const TABLE = "CLIENTE";

export const getClientes = async (idOrganizacion = null) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estadoCliente", true);
  
  // Filtrar por organización si se proporciona
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  const { data, error } = await query.order("idCliente", { ascending: true });
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

