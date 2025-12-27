import { supabase } from "../../../api/supabaseClient";

const TABLE = "CATEGORIA";

export const getCategorias = async (idOrganizacion = null, incluirInactivas = false) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select("*");
  
  // Filtrar por estado solo si no se incluyen inactivas
  if (!incluirInactivas) {
    query = query.eq("estadoCategoria", true);
  }
  
  // Filtrar por organización si se proporciona
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  const { data, error } = await query.order("idCategoria", { ascending: true });
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
