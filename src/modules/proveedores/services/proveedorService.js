import { supabase } from "../../../api/supabaseClient";

const TABLE = "PROVEEDOR";

export const getProveedores = async (idOrganizacion = null) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estado", true);
  
  // Filtrar por organización si se proporciona
  if (orgId) {
    query = query.eq("idOrganizacion", orgId);
  }
  
  const { data, error } = await query.order("idProveedor", { ascending: true });
  if (error) throw error;
  return data;
};

export const createProveedor = async (proveedor) => {
  // Validar que numeroDocumento y tipoDocumento estén presentes
  if (!proveedor.numeroDocumento || !proveedor.tipoDocumento) {
    throw new Error("El número de documento y tipo de documento son obligatorios");
  }

  // Verificar si ya existe un proveedor con el mismo documento en la organización
  if (proveedor.idOrganizacion) {
    const { data: existente, error: errorCheck } = await supabase
      .from(TABLE)
      .select("idProveedor, nombre, numeroDocumento")
      .eq("idOrganizacion", proveedor.idOrganizacion)
      .eq("numeroDocumento", proveedor.numeroDocumento)
      .eq("estado", true)
      .maybeSingle();
    
    if (errorCheck && errorCheck.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw errorCheck;
    }
    
    if (existente) {
      throw new Error(`Ya existe un proveedor con el documento ${proveedor.numeroDocumento} en esta organización`);
    }
  }

  const { data, error } = await supabase.from(TABLE).insert([proveedor]).select();
  
  if (error) {
    // Manejar error de índice único
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      throw new Error(`Ya existe un proveedor con el documento ${proveedor.numeroDocumento} en esta organización`);
    }
    throw error;
  }
  
  return data[0];
};

export const updateProveedor = async (idProveedor, proveedor) => {
  // Validar que numeroDocumento y tipoDocumento estén presentes
  if (proveedor.numeroDocumento !== undefined && !proveedor.numeroDocumento) {
    throw new Error("El número de documento es obligatorio");
  }
  if (proveedor.tipoDocumento !== undefined && !proveedor.tipoDocumento) {
    throw new Error("El tipo de documento es obligatorio");
  }

  // Si se está actualizando el numeroDocumento, verificar que no exista otro proveedor con el mismo documento
  if (proveedor.numeroDocumento && proveedor.idOrganizacion) {
    const { data: existente, error: errorCheck } = await supabase
      .from(TABLE)
      .select("idProveedor, nombre, numeroDocumento")
      .eq("idOrganizacion", proveedor.idOrganizacion)
      .eq("numeroDocumento", proveedor.numeroDocumento)
      .eq("estado", true)
      .neq("idProveedor", idProveedor) // Excluir el proveedor actual
      .maybeSingle();
    
    if (errorCheck && errorCheck.code !== 'PGRST116') {
      throw errorCheck;
    }
    
    if (existente) {
      throw new Error(`Ya existe otro proveedor con el documento ${proveedor.numeroDocumento} en esta organización`);
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(proveedor)
    .eq("idProveedor", idProveedor)
    .select();
  
  if (error) {
    // Manejar error de índice único
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      throw new Error(`Ya existe otro proveedor con el documento ${proveedor.numeroDocumento} en esta organización`);
    }
    throw error;
  }
  
  return data[0];
};

export const deleteProveedor = async (idProveedor) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estado: false })
    .eq("idProveedor", idProveedor);
  if (error) throw error;
};
