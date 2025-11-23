import { supabase } from "../../../api/supabaseClient";

const TABLE = "USUARIOROL";

/**
 * Obtiene los roles de un usuario
 */
export const getRolesByUsuario = async (idUsuario) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      rol:ROL(*)
    `)
    .eq("idUsuario", idUsuario)
    .eq("estadoUsuarioRol", true);
  
  if (error) throw error;
  return data;
};

/**
 * Obtiene el primer rol activo de un usuario (útil para verificar superadmin)
 */
export const getPrimerRolUsuario = async (idUsuario) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      rol:ROL(*)
    `)
    .eq("idUsuario", idUsuario)
    .eq("estadoUsuarioRol", true)
    .limit(1)
    .single();
  
  if (error && error.code !== "PGRST116") throw error;
  return data;
};

/**
 * Asigna un rol a un usuario
 */
export const asignarRolAUsuario = async (idUsuario, idRol) => {
  // Verificar si ya existe la relación
  const { data: existing } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idUsuario", idUsuario)
    .eq("idRol", idRol)
    .single();

  if (existing) {
    // Si existe pero está inactiva, reactivarla
    if (!existing.estadoUsuarioRol) {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ estadoUsuarioRol: true })
        .eq("idUsuario", idUsuario)
        .eq("idRol", idRol)
        .select(`
          *,
          rol:ROL(*)
        `);
      if (error) throw error;
      return data[0];
    }
    return existing;
  }

  // Crear nueva relación
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      idUsuario,
      idRol,
      estadoUsuarioRol: true,
    }])
    .select(`
      *,
      rol:ROL(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Remueve un rol de un usuario (soft delete)
 */
export const removerRolDeUsuario = async (idUsuario, idRol) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoUsuarioRol: false })
    .eq("idUsuario", idUsuario)
    .eq("idRol", idRol);
  
  if (error) throw error;
};

/**
 * Asigna múltiples roles a un usuario
 * Primero elimina todos los roles actuales, luego asigna los nuevos
 */
export const asignarRolesAUsuario = async (idUsuario, idsRoles) => {
  // Primero, desactivar todos los roles actuales del usuario
  await supabase
    .from(TABLE)
    .update({ estadoUsuarioRol: false })
    .eq("idUsuario", idUsuario);

  // Si no hay roles para asignar, terminar aquí
  if (!idsRoles || idsRoles.length === 0) {
    return [];
  }

  // Luego, crear o reactivar los roles seleccionados
  const rolesData = idsRoles.map((idRol) => ({
    idUsuario,
    idRol,
    estadoUsuarioRol: true,
  }));

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(rolesData, {
      onConflict: "idUsuario,idRol",
      ignoreDuplicates: false,
    })
    .select(`
      *,
      rol:ROL(*)
    `);
  
  if (error) throw error;
  return data;
};

/**
 * Verifica si un usuario tiene un rol específico
 */
export const usuarioTieneRol = async (idUsuario, nombreRol) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      rol:ROL(*)
    `)
    .eq("idUsuario", idUsuario)
    .eq("estadoUsuarioRol", true)
    .eq("rol.nombreRol", nombreRol);
  
  if (error) throw error;
  return data && data.length > 0;
};

