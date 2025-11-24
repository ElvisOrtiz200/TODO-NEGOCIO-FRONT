import { supabase } from "../../../api/supabaseClient";

const TABLE = "PRODUCTO";

export const getProductos = async (idOrganizacion = null) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      categoria:CATEGORIA(*),
      almacen:ALMACEN(*)
    `)
    .eq("estadoProducto", true);
  
  // Filtrar por organización si se proporciona
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  const { data, error } = await query.order("idProducto", { ascending: true });
  if (error) throw error;
  return data;
};

export const createProducto = async (producto) => {
  const { data, error } = await supabase.from(TABLE).insert([producto]).select();
  if (error) throw error;
  return data[0];
};

export const updateProducto = async (idProducto, producto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(producto)
    .eq("idProducto", idProducto)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteProducto = async (idProducto) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoProducto: false })
    .eq("idProducto", idProducto);
  if (error) throw error;
};

export const getProductoById = async (idProducto) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idProducto", idProducto)
    .single();
  if (error) throw error;
  return data;
};

