import { supabase } from "../api/supabaseClient";

/**
 * Servicio de autenticación mejorado para SAAS multi-tenant
 * Maneja la validación de usuarios y su membresía en organizaciones
 */

/**
 * Obtiene el usuario del sistema (tabla USUARIO) asociado al usuario de Supabase Auth
 */
export const getUsuarioSistema = async (authUserId) => {
  try {
    // Primero obtener el usuario básico
    const { data: usuarioBase, error: usuarioError } = await supabase
      .from("USUARIO")
      .select("*")
      .eq("authUserId", authUserId)
      .eq("estadoUsuario", true)
      .maybeSingle();

    if (usuarioError && usuarioError.code !== "PGRST116") throw usuarioError;
    if (!usuarioBase) return null;

    let organizacionData = null;
    if (usuarioBase.organizacionId) {
      // Asegurar que organizacionId sea string para comparaciones UUID
      const orgId = String(usuarioBase.organizacionId);
      const { data: orgData, error: orgError } = await supabase
        .from("ORGANIZACION")
        .select("*")
        .eq("idOrganizacion", orgId)
        .maybeSingle();

      if (!orgError) {
        organizacionData = orgData;
      } else if (orgError.code !== "PGRST116") {
        console.warn("Error obteniendo organización:", orgError);
      }
    }

    // Luego obtener los roles por separado para evitar problemas con RLS
    const { data: rolesData, error: rolesError } = await supabase
      .from("USUARIOROL")
      .select(`
        estadoUsuarioRol,
        rol:ROL(*)
      `)
      .eq("idUsuario", usuarioBase.idUsuario)
      .eq("estadoUsuarioRol", true);

    // Si hay error con roles, solo loguear pero continuar
    if (rolesError) {
      console.warn("Error obteniendo roles (puede ser RLS):", rolesError);
    }

    // Procesar roles
    let roles = [];
    if (rolesData && Array.isArray(rolesData)) {
      roles = rolesData;
    }

    // Agregar roles al objeto usuario
    const usuarioData = {
      ...usuarioBase,
      organizacion: organizacionData,
      roles,
    };
    
    // Si hay roles, tomar el primero como rol principal (para compatibilidad)
    if (roles.length > 0) {
      usuarioData.rol = roles[0].rol; // Para compatibilidad con código existente
    } else {
      usuarioData.rol = null;
    }
    
    return usuarioData;
  } catch (error) {
    console.error("Error obteniendo usuario del sistema:", error);
    return null;
  }
};

/**
 * Verifica si un usuario es superadmin
 */
export const esSuperAdmin = async (authUserId) => {
  try {
    const usuario = await getUsuarioSistema(authUserId);
    
    console.log("🔍 Verificando superadmin para:", authUserId);
    console.log("👤 Usuario obtenido:", usuario);
    
    if (!usuario) {
      console.log("❌ Usuario no encontrado en el sistema");
      return false;
    }
    
    if (!usuario.roles || usuario.roles.length === 0) {
      console.log("❌ Usuario no tiene roles asignados");
      return false;
    }
    
    console.log("📋 Roles del usuario:", usuario.roles);
    
    // Verificar si alguno de los roles es "SUPERADMIN"
    const isAdmin = usuario.roles.some(usuarioRol => {
      const nombreRol = usuarioRol.rol?.nombreRol?.toUpperCase();
      const idRol = usuarioRol.rol?.idRol;
      const esSuperAdmin = nombreRol === "SUPERADMIN" || nombreRol === "ADMIN" || idRol === 1;
      
      console.log(`  - Rol: ${nombreRol} (ID: ${idRol}), Es SuperAdmin: ${esSuperAdmin}`);
      
      return esSuperAdmin;
    });
    
    console.log(isAdmin ? "✅ Usuario ES superadmin" : "❌ Usuario NO es superadmin");
    
    return isAdmin;
  } catch (error) {
    console.error("❌ Error verificando superadmin:", error);
    return false;
  }
};

/**
 * Verifica si un usuario pertenece a una organización activa
 */
export const validarMembresiaOrganizacion = async (authUserId) => {
  try {
    const usuario = await getUsuarioSistema(authUserId);
    
    // Si el usuario no existe, es un usuario nuevo (no es un error)
    if (!usuario) {
      return {
        valido: false,
        usuario: null,
        organizacion: null,
        mensaje: "Usuario nuevo - necesita onboarding"
      };
    }

    // Si el usuario existe pero no tiene organización activa
    if (!usuario.organizacion || !usuario.organizacion.estadoOrganizacion) {
      return {
        valido: false,
        usuario: usuario,
        organizacion: usuario.organizacion,
        mensaje: "Usuario no pertenece a una organización activa"
      };
    }

    // Usuario válido con organización activa
    return {
      valido: true,
      usuario: usuario,
      organizacion: usuario.organizacion,
      mensaje: "Usuario válido"
    };
  } catch (error) {
    console.error("Error validando membresía:", error);
    // En caso de error, retornar como usuario nuevo (no bloquear)
    return {
      valido: false,
      usuario: null,
      organizacion: null,
      mensaje: "Error al validar membresía - usuario nuevo"
    };
  }
};

/**
 * Crea un nuevo usuario en el sistema
 * Solo puede ser llamado por un superadmin
 */
export const crearUsuarioSistema = async (authUser, organizacionId = null, rolId = null) => {
  try {
    // Asegurar que organizacionId sea string para comparaciones UUID
    const orgId = organizacionId ? String(organizacionId) : null;
    const nuevoUsuario = {
      authUserId: authUser.id || authUser,
      email: authUser.email || authUser,
      nombreUsuario: authUser.nombreUsuario || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Usuario",
      organizacionId: orgId,
      rolId: rolId,
      estadoUsuario: true,
      fechaCreacion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("USUARIO")
      .insert([nuevoUsuario])
      .select(`
        *,
        organizacion:ORGANIZACION(*),
        rol:ROL(*)
      `)
      .single();

    if (error) throw error;

    return {
      success: true,
      usuario: data
    };
  } catch (error) {
    console.error("Error creando usuario del sistema:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtiene la organización actual del usuario autenticado
 */
export const getOrganizacionActual = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const validacion = await validarMembresiaOrganizacion(user.id);
    return validacion.valido ? validacion.organizacion : null;
  } catch (error) {
    console.error("Error obteniendo organización actual:", error);
    return null;
  }
};

/**
 * Vincula un usuario existente a una organización
 */
export const vincularUsuarioAOrganizacion = async (authUserId, organizacionId) => {
  try {
    // Asegurar que organizacionId sea string para comparaciones UUID
    const orgId = organizacionId ? String(organizacionId) : null;
    const { data, error } = await supabase
      .from("USUARIO")
      .update({ organizacionId: orgId })
      .eq("authUserId", authUserId)
      .select(`
        *,
        organizacion:ORGANIZACION(*)
      `)
      .single();

    if (error) throw error;

    return {
      success: true,
      usuario: data
    };
  } catch (error) {
    console.error("Error vinculando usuario a organización:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifica si un email ya está registrado en el sistema
 */
export const verificarEmailExistente = async (email) => {
  try {
    const { data, error } = await supabase
      .from("USUARIO")
      .select("idUsuario, email, organizacion:ORGANIZACION(*)")
      .eq("email", email)
      .eq("estadoUsuario", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    
    return {
      existe: !!data,
      usuario: data || null
    };
  } catch (error) {
    console.error("Error verificando email:", error);
    return {
      existe: false,
      usuario: null
    };
  }
};

