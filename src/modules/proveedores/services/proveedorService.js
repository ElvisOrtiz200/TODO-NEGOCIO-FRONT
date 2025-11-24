import { supabase } from "../../../api/supabaseClient";

const TABLE = "PROVEEDOR";

export const getProveedores = async (idOrganizacion = null) => {
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estadoProveedor", true);
  
  // Filtrar por organización si se proporciona
  if (idOrganizacion) {
    query = query.eq("idOrganizacion", idOrganizacion);
  }
  
  const { data, error } = await query.order("idProveedor", { ascending: true });
  if (error) throw error;
  return data;
};

export const createProveedor = async (proveedor) => {
  const { data, error } = await supabase.from(TABLE).insert([proveedor]).select();
  if (error) throw error;
  return data[0];
};

export const updateProveedor = async (idProveedor, proveedor) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(proveedor)
    .eq("idProveedor", idProveedor)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteProveedor = async (idProveedor) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoProveedor: false })
    .eq("idProveedor", idProveedor);
  if (error) throw error;
};
