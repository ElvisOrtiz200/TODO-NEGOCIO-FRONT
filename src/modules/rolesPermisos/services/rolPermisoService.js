import { supabase } from "../../../api/supabaseClient";

const TABLE = "ROLPERMISO";

// Obtener permisos de un rol
export const getPermisosByRol = async (idRol) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      permiso:PERMISO(*)
    `)
    .eq("idRol", idRol)
    .eq("estadoRolPermiso", true);
  if (error) throw error;
  return data;
};

// Asignar permiso a un rol
export const asignarPermisoARol = async (idRol, idPermiso) => {
  // Verificar si ya existe la relación
  const { data: existing } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idRol", idRol)
    .eq("idPermiso", idPermiso)
    .single();

  if (existing) {
    // Si existe pero está inactiva, reactivarla
    if (!existing.estadoRolPermiso) {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ estadoRolPermiso: true })
        .eq("idRol", idRol)
        .eq("idPermiso", idPermiso)
        .select();
      if (error) throw error;
      return data[0];
    }
    return existing;
  }

  // Crear nueva relación
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      idRol,
      idPermiso,
      estadoRolPermiso: true,
    }])
    .select();
  if (error) throw error;
  return data[0];
};

// Remover permiso de un rol (soft delete)
export const removerPermisoDeRol = async (idRol, idPermiso) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoRolPermiso: false })
    .eq("idRol", idRol)
    .eq("idPermiso", idPermiso);
  if (error) throw error;
};

// Obtener todos los roles con sus permisos
export const getRolesConPermisos = async () => {
  // Obtener roles
  const { data: rolesData, error: rolesError } = await supabase
    .from("ROL")
    .select("*")
    .eq("estadoRol", true);
  
  if (rolesError) throw rolesError;
  if (!rolesData || rolesData.length === 0) return [];

  // Obtener todos los permisos de los roles
  const idsRoles = rolesData.map(r => r.idRol);
  const { data: permisosData, error: permisosError } = await supabase
    .from("ROLPERMISO")
    .select(`
      idRol,
      estadoRolPermiso,
      permiso:PERMISO(*)
    `)
    .in("idRol", idsRoles)
    .eq("estadoRolPermiso", true);

  if (permisosError) {
    console.warn("Error obteniendo permisos:", permisosError);
  }

  // Combinar roles con sus permisos
  return rolesData.map(rol => ({
    ...rol,
    permisos: permisosData?.filter(rp => rp.idRol === rol.idRol) || []
  }));
};

// Asignar múltiples permisos a un rol
export const asignarPermisosARol = async (idRol, idsPermisos) => {
  try {
    console.log("📝 Asignando permisos al rol:", { idRol, idsPermisos });
    
    // Primero, desactivar todos los permisos actuales del rol
    console.log("🔄 Desactivando permisos actuales del rol...");
    const { error: updateError } = await supabase
      .from(TABLE)
      .update({ estadoRolPermiso: false })
      .eq("idRol", idRol);
    
    if (updateError) {
      console.error("❌ Error desactivando permisos:", updateError);
      throw updateError;
    }

    // Si no hay permisos seleccionados, solo desactivar todos y retornar
    if (!idsPermisos || idsPermisos.length === 0) {
      console.log("ℹ️ No hay permisos seleccionados, solo se desactivaron los existentes");
      return [];
    }

    // Luego, crear o reactivar los permisos seleccionados
    const permisosData = idsPermisos.map((idPermiso) => ({
      idRol,
      idPermiso,
      estadoRolPermiso: true,
    }));

    console.log("➕ Creando/reactivando permisos:", permisosData);
    
    const { data, error } = await supabase
      .from(TABLE)
      .upsert(permisosData, {
        onConflict: "idRol,idPermiso",
        ignoreDuplicates: false,
      })
      .select();
    
    if (error) {
      console.error("❌ Error de Supabase al asignar permisos:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn("⚠️ No se retornaron datos al asignar permisos");
    } else {
      console.log("✅ Permisos asignados exitosamente:", data.length);
    }
    
    return data || [];
  } catch (error) {
    console.error("❌ Error en asignarPermisosARol:", error);
    throw error;
  }
};

