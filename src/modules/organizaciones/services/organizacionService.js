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
      planesActivos:ORGANIZACIONPLAN!organizacionId(
        *,
        plan:PLAN(*)
      )
    `)
    .eq("estadoOrganizacion", true)
    .order("nombreOrganizacion", { ascending: true });
  if (error) throw error;
  
  // Mapear para mantener compatibilidad con código existente
  return data.map(org => ({
    ...org,
    plan: org.planesActivos?.find(p => p.estado === "activo")?.plan || null
  }));
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
      planesActivos:ORGANIZACIONPLAN!organizacionId(
        *,
        plan:PLAN(*)
      )
    `)
    .eq("idOrganizacion", idOrg)
    .single();
  if (error) throw error;
  
  // Mapear para mantener compatibilidad con código existente
  return {
    ...data,
    plan: data.planesActivos?.find(p => p.estado === "activo")?.plan || null
  };
};

/**
 * Crea una nueva organización
 * Solo puede ser llamada por un superadmin
 * Nota: El plan se asigna desde el módulo de planes usando ORGANIZACIONPLAN
 */
export const createOrganizacion = async (organizacion) => {
  const nuevaOrganizacion = {
    ...organizacion,
    estadoOrganizacion: true,
    fechaCreacion: new Date().toISOString()
  };

  // Eliminar planId si existe (ya no se usa)
  delete nuevaOrganizacion.planId;

  const { data, error } = await supabase
    .from(TABLE)
    .insert([nuevaOrganizacion])
    .select(`
      *,
      planesActivos:ORGANIZACIONPLAN!organizacionId(
        *,
        plan:PLAN(*)
      )
    `)
    .single();
  
  if (error) throw error;
  
  // Mapear para mantener compatibilidad con código existente
  return {
    ...data,
    plan: data.planesActivos?.find(p => p.estado === "activo")?.plan || null
  };
};

/**
 * Actualiza una organización
 * Nota: planId ya no se usa, los planes se gestionan desde ORGANIZACIONPLAN
 */
export const updateOrganizacion = async (idOrganizacion, organizacion) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  
  // Eliminar planId si existe (ya no se usa)
  const organizacionActualizada = { ...organizacion };
  delete organizacionActualizada.planId;
  
  const { data, error } = await supabase
    .from(TABLE)
    .update(organizacionActualizada)
    .eq("idOrganizacion", idOrg)
    .select(`
      *,
      planesActivos:ORGANIZACIONPLAN!organizacionId(
        *,
        plan:PLAN(*)
      )
    `)
    .single();
  
  if (error) throw error;
  
  // Mapear para mantener compatibilidad con código existente
  return {
    ...data,
    plan: data.planesActivos?.find(p => p.estado === "activo")?.plan || null
  };
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

