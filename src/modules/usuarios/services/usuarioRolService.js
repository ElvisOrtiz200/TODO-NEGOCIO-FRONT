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
  try {
    console.log("📝 Asignando roles al usuario:", { idUsuario, idsRoles });
    
    // Si no hay roles para asignar, solo desactivar todos los existentes
    if (!idsRoles || idsRoles.length === 0) {
      console.log("ℹ️ No hay roles para asignar, desactivando todos los existentes...");
      const { error: updateError } = await supabase
        .from(TABLE)
        .update({ estadoUsuarioRol: false })
        .eq("idUsuario", idUsuario);
      
      if (updateError) {
        console.error("❌ Error desactivando roles:", updateError);
        throw updateError;
      }
      return [];
    }

    // Obtener los roles actuales del usuario
    const { data: rolesActuales, error: fetchError } = await supabase
      .from(TABLE)
      .select("*")
      .eq("idUsuario", idUsuario);
    
    if (fetchError) {
      console.error("❌ Error obteniendo roles actuales:", fetchError);
      throw fetchError;
    }

    // Procesar cada rol que se quiere asignar
    const resultados = [];
    
    for (const idRol of idsRoles) {
      // Verificar si ya existe la relación
      const relacionExistente = rolesActuales?.find(
        r => r.idRol === idRol && r.idUsuario === idUsuario
      );

      if (relacionExistente) {
        // Si existe, solo reactivarla si está inactiva
        if (!relacionExistente.estadoUsuarioRol) {
          console.log(`🔄 Reactivando rol ${idRol} para usuario ${idUsuario}`);
          const { data, error } = await supabase
            .from(TABLE)
            .update({ estadoUsuarioRol: true })
            .eq("idUsuario", idUsuario)
            .eq("idRol", idRol)
            .select(`
              *,
              rol:ROL(*)
            `)
            .single();
          
          if (error) {
            console.error(`❌ Error reactivando rol ${idRol}:`, error);
            throw error;
          }
          resultados.push(data);
        } else {
          console.log(`ℹ️ Rol ${idRol} ya está activo para usuario ${idUsuario}`);
          // Obtener el rol completo para retornarlo
          const { data: rolData } = await supabase
            .from(TABLE)
            .select(`
              *,
              rol:ROL(*)
            `)
            .eq("idUsuario", idUsuario)
            .eq("idRol", idRol)
            .eq("estadoUsuarioRol", true)
            .single();
          
          if (rolData) {
            resultados.push(rolData);
          }
        }
      } else {
        // Si no existe, crear nueva relación
        console.log(`➕ Creando nueva relación usuario-rol: ${idUsuario} -> ${idRol}`);
        const { data, error } = await supabase
          .from(TABLE)
          .insert({
            idUsuario,
            idRol,
            estadoUsuarioRol: true,
          })
          .select(`
            *,
            rol:ROL(*)
          `)
          .single();
        
        if (error) {
          // Si el error es por duplicado, intentar actualizar
          if (error.code === "23505" || error.message.includes("duplicate")) {
            console.log(`⚠️ Duplicado detectado, intentando actualizar rol ${idRol}`);
            const { data: updatedData, error: updateError } = await supabase
              .from(TABLE)
              .update({ estadoUsuarioRol: true })
              .eq("idUsuario", idUsuario)
              .eq("idRol", idRol)
              .select(`
                *,
                rol:ROL(*)
              `)
              .single();
            
            if (updateError) {
              console.error(`❌ Error actualizando rol ${idRol}:`, updateError);
              throw updateError;
            }
            resultados.push(updatedData);
          } else {
            console.error(`❌ Error creando rol ${idRol}:`, error);
            throw error;
          }
        } else {
          resultados.push(data);
        }
      }
    }

    // Desactivar los roles que no están en la lista
    const idsRolesActivos = idsRoles.map(id => parseInt(id));
    const rolesADesactivar = rolesActuales?.filter(
      r => r.estadoUsuarioRol && !idsRolesActivos.includes(r.idRol)
    ) || [];

    if (rolesADesactivar.length > 0) {
      console.log(`🔄 Desactivando ${rolesADesactivar.length} roles que ya no están asignados`);
      const idsADesactivar = rolesADesactivar.map(r => r.idRol);
      
      for (const idRol of idsADesactivar) {
        const { error: deactivateError } = await supabase
          .from(TABLE)
          .update({ estadoUsuarioRol: false })
          .eq("idUsuario", idUsuario)
          .eq("idRol", idRol);
        
        if (deactivateError) {
          console.error(`❌ Error desactivando rol ${idRol}:`, deactivateError);
          // No lanzar error, solo registrar
        }
      }
    }
    
    console.log("✅ Roles asignados exitosamente:", resultados.length);
    return resultados;
  } catch (error) {
    console.error("❌ Error en asignarRolesAUsuario:", error);
    throw error;
  }
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

