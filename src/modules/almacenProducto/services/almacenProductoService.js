import { supabase } from "../../../api/supabaseClient";

const TABLE = "ALMACENPRODUCTO";

export const getAlmacenProductos = async (idOrganizacion = null, idProducto = null, idAlmacen = null) => {
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      producto:PRODUCTO(*),
      almacen:ALMACEN(*)
    `)
    .eq("estadoAlmacenProducto", true);
  
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  if (idProducto) {
    query = query.eq("idProducto", idProducto);
  }
  
  if (idAlmacen) {
    query = query.eq("idAlmacen", idAlmacen);
  }
  
  const { data, error } = await query.order("idProducto", { ascending: true });
  if (error) throw error;
  return data;
};

export const createAlmacenProducto = async (almacenProducto) => {
  const { data, error } = await supabase.from(TABLE).insert([almacenProducto]).select();
  if (error) throw error;
  return data[0];
};

export const updateAlmacenProducto = async (idAlmacen, idProducto, almacenProducto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(almacenProducto)
    .eq("idAlmacen", idAlmacen)
    .eq("idProducto", idProducto)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteAlmacenProducto = async (idAlmacen, idProducto) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoAlmacenProducto: false })
    .eq("idAlmacen", idAlmacen)
    .eq("idProducto", idProducto);
  if (error) throw error;
};

export const getAlmacenProductoByProducto = async (idProducto, idOrganizacion = null) => {
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("idProducto", idProducto)
    .eq("estadoAlmacenProducto", true);
  
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

