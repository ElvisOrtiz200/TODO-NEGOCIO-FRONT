import { supabase } from "../../../api/supabaseClient";

const TABLE = "ALMACEN";

export const getAlmacenes = async (idOrganizacion = null, includeOrganizacion = false) => {
  let query = supabase
    .from(TABLE)
    .select(includeOrganizacion ? `*, organizacion:ORGANIZACION(nombreOrganizacion, idOrganizacion)` : "*")
    .eq("estadoAlmacen", true);
  
  // Filtrar por organización si se proporciona
  if (idOrganizacion) {
    query = query.eq("idOrganizacion", idOrganizacion);
  }
  
  const { data, error } = await query.order("idAlmacen", { ascending: true });
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
