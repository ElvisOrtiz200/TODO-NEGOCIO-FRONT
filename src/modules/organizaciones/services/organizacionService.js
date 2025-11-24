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
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      plan:PLAN(*)
    `)
    .eq("idOrganizacion", idOrg)
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
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  const { data, error } = await supabase
    .from(TABLE)
    .update(organizacion)
    .eq("idOrganizacion", idOrg)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Elimina (desactiva) una organización
 */
export const deleteOrganizacion = async (idOrganizacion) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoOrganizacion: false })
    .eq("idOrganizacion", idOrg);
  
  if (error) throw error;
};

/**
 * Obtiene los usuarios de una organización
 */
export const getUsuariosOrganizacion = async (idOrganizacion) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  const { data, error } = await supabase
    .from("USUARIO")
    .select("*")
    .eq("organizacionId", idOrg)
    .eq("estadoUsuario", true)
    .order("nombreUsuario", { ascending: true });
  
  if (error) throw error;
  return data;
};

/**
 * Actualiza la autorización para que el superadmin gestione usuarios de una organización
 */
export const actualizarAutorizacionSuperadmin = async (idOrganizacion, autorizado, autorizadoPor = null) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  const payload = {
    autorizaSuperadminUsuarios: autorizado,
    autorizaSuperadminUsuariosDesde: autorizado ? new Date().toISOString() : null,
    autorizaSuperadminUsuariosPor: autorizado ? autorizadoPor : null,
  };

  return await updateOrganizacion(idOrg, payload);
};

