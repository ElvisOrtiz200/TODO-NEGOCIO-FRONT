import { supabase } from "../../../api/supabaseClient";

const TABLE = "ORGANIZACION";

/**
 * Obtiene todas las organizaciones activas
 * Solo para superadmin o usuarios con permisos especiales
 */
export const getOrganizaciones = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      plan:PLAN(*)
    `)
    .eq("estadoOrganizacion", true)
    .order("nombreOrganizacion", { ascending: true });
  if (error) throw error;
  return data;
};

/**
 * Obtiene una organización por ID
 */
export const getOrganizacionById = async (idOrganizacion) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      plan:PLAN(*)
    `)
    .eq("idOrganizacion", idOrganizacion)
    .single();
  if (error) throw error;
  return data;
};

/**
 * Crea una nueva organización
 * Solo puede ser llamada por un superadmin
 */
export const createOrganizacion = async (organizacion) => {
  const nuevaOrganizacion = {
    ...organizacion,
    estadoOrganizacion: true,
    fechaCreacion: new Date().toISOString()
  };

  // Si no se proporciona planId, usar un plan por defecto
  if (!nuevaOrganizacion.planId) {
    nuevaOrganizacion.planId = 1; // Plan básico por defecto
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert([nuevaOrganizacion])
    .select(`
      *,
      plan:PLAN(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Actualiza una organización
 */
export const updateOrganizacion = async (idOrganizacion, organizacion) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(organizacion)
    .eq("idOrganizacion", idOrganizacion)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Elimina (desactiva) una organización
 */
export const deleteOrganizacion = async (idOrganizacion) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoOrganizacion: false })
    .eq("idOrganizacion", idOrganizacion);
  
  if (error) throw error;
};

/**
 * Obtiene los usuarios de una organización
 */
export const getUsuariosOrganizacion = async (idOrganizacion) => {
  const { data, error } = await supabase
    .from("USUARIO")
    .select("*")
    .eq("organizacionId", idOrganizacion)
    .eq("estadoUsuario", true)
    .order("nombreUsuario", { ascending: true });
  
  if (error) throw error;
  return data;
};

