import { supabase } from "../../../api/supabaseClient";

const TABLE = "USUARIO";

/**
 * Obtiene todos los usuarios activos de una organización
 * Si organizacionId es null, obtiene todos los usuarios (para superadmin)
 */
export const getUsuarios = async (organizacionId = null) => {
  // Siempre usar LEFT JOIN para obtener usuarios con o sin roles
  // Luego filtrar en memoria según sea necesario
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      organizacion:ORGANIZACION(*),
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(*)
      )
    `)
    .eq("estadoUsuario", true);

  if (organizacionId) {
    query = query.eq("organizacionId", organizacionId);
  }

  const { data, error } = await query.order("nombreUsuario", { ascending: true });
  
  if (error) {
    console.error("Error en getUsuarios:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Debug: verificar la estructura de datos
  if (data.length > 0 && data[0]) {
    console.log("Estructura de usuario ejemplo:", {
      idUsuario: data[0].idUsuario,
      nombreUsuario: data[0].nombreUsuario,
      roles: data[0].roles,
      tipoRoles: typeof data[0].roles,
      esArray: Array.isArray(data[0].roles)
    });
  }
  
  // Procesar usuarios y sus roles
  const usuariosProcesados = data.map(usuario => {
    let rolesActivos = [];
    
    // Asegurarse de que roles sea un array
    const rolesUsuario = Array.isArray(usuario.roles) ? usuario.roles : (usuario.roles ? [usuario.roles] : []);
    
    // Filtrar solo roles activos y que tengan el objeto rol cargado
    rolesActivos = rolesUsuario.filter(ur => {
      // Asegurarse de que el rol existe, está activo y tiene el objeto rol cargado
      return ur && 
             ur.estadoUsuarioRol === true && 
             ur.rol && 
             ur.rol.nombreRol;
    });
    
    // Si es para una organización específica y no tiene roles activos, filtrar el usuario
    if (organizacionId !== null && rolesActivos.length === 0) {
      return null; // Este usuario será filtrado
    }
    
    return {
      ...usuario,
      roles: rolesActivos,
      rol: rolesActivos.length > 0 ? rolesActivos[0].rol : null
    };
  }).filter(usuario => usuario !== null); // Filtrar usuarios null (sin roles activos cuando es para org específica)
  
  return usuariosProcesados;
};

/**
 * Obtiene un usuario por ID
 */
export const getUsuarioById = async (idUsuario) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      organizacion:ORGANIZACION(*),
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(*)
      )
    `)
    .eq("idUsuario", idUsuario)
    .single();
  
  if (error) throw error;
  
  // Agregar rol principal para compatibilidad
  if (data.roles && data.roles.length > 0) {
    const rolActivo = data.roles.find(ur => ur.estadoUsuarioRol);
    data.rol = rolActivo ? rolActivo.rol : (data.roles[0]?.rol || null);
  }
  
  return data;
};

/**
 * Obtiene un usuario por authUserId (Supabase Auth)
 */
export const getUsuarioByAuthId = async (authUserId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      organizacion:ORGANIZACION(*),
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(*)
      )
    `)
    .eq("authUserId", authUserId)
    .eq("estadoUsuario", true)
    .single();
  
  if (error && error.code !== "PGRST116") throw error;
  
  // Agregar rol principal para compatibilidad
  if (data && data.roles && data.roles.length > 0) {
    const rolActivo = data.roles.find(ur => ur.estadoUsuarioRol);
    data.rol = rolActivo ? rolActivo.rol : (data.roles[0]?.rol || null);
  }
  
  return data;
};

/**
 * Crea un nuevo usuario
 */
export const createUsuario = async (usuario) => {
  // Extraer roles del objeto usuario (si viene)
  const { rolId, roles, ...datosUsuario } = usuario;
  
  // Si ya existe idUsuario, significa que el usuario ya fue creado (por trigger)
  // Solo actualizar los datos
  if (datosUsuario.idUsuario) {
    const { idUsuario, ...datosActualizar } = datosUsuario;
    return await updateUsuario(idUsuario, datosActualizar);
  }
  
  const nuevoUsuario = {
    ...datosUsuario,
    estadoUsuario: true,
    fechaCreacion: new Date().toISOString()
  };

  // Intentar insertar, pero si el usuario ya existe (por trigger), actualizar
  let { data, error } = await supabase
    .from(TABLE)
    .insert([nuevoUsuario])
    .select(`
      *,
      organizacion:ORGANIZACION(*)
    `)
    .single();
  
  // Si el error es por duplicado (usuario ya existe), actualizar en su lugar
  if (error && error.code === "23505") {
    // Buscar el usuario existente por authUserId o email
    const { data: usuarioExistente, error: searchError } = await supabase
      .from(TABLE)
      .select(`
        *,
        organizacion:ORGANIZACION(*)
      `)
      .or(`authUserId.eq.${datosUsuario.authUserId},emailUsuario.eq.${datosUsuario.emailUsuario}`)
      .single();
    
    if (searchError) throw searchError;
    
    // Actualizar el usuario existente
    const { data: updatedData, error: updateError } = await supabase
      .from(TABLE)
      .update({
        ...nuevoUsuario,
        fechaCreacion: usuarioExistente.fechaCreacion, // Preservar fecha original
      })
      .eq("idUsuario", usuarioExistente.idUsuario)
      .select(`
        *,
        organizacion:ORGANIZACION(*)
      `)
      .single();
    
    if (updateError) throw updateError;
    return updatedData;
  }
  
  if (error) throw error;
  
  // Si se proporcionó rolId o roles, asignarlos
  if (rolId || (roles && roles.length > 0)) {
    const idsRoles = roles || [rolId].filter(Boolean);
    // Esto se manejará en el componente que llama a esta función
    // usando asignarRolesAUsuario de usuarioRolService
  }
  
  return data;
};

/**
 * Actualiza un usuario
 */
export const updateUsuario = async (idUsuario, usuario) => {
  // Extraer roles del objeto usuario
  const { rolId, roles, ...datosUsuario } = usuario;
  
  const { data, error } = await supabase
    .from(TABLE)
    .update(datosUsuario)
    .eq("idUsuario", idUsuario)
    .select(`
      *,
      organizacion:ORGANIZACION(*)
    `)
    .single();
  
  if (error) throw error;
  
  // Los roles se actualizarán por separado usando usuarioRolService
  return data;
};

/**
 * Elimina (desactiva) un usuario
 */
export const deleteUsuario = async (idUsuario) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoUsuario: false })
    .eq("idUsuario", idUsuario);
  
  if (error) throw error;
};

/**
 * Busca usuarios por email
 */
export const buscarUsuarioPorEmail = async (email) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      organizacion:ORGANIZACION(*),
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(*)
      )
    `)
    .eq("emailUsuario", email)
    .eq("estadoUsuario", true);
  
  if (error) throw error;
  
  // Agregar rol principal para compatibilidad
  return data.map(usuario => ({
    ...usuario,
    rol: usuario.roles && usuario.roles.length > 0 
      ? usuario.roles.find(ur => ur.estadoUsuarioRol)?.rol || usuario.roles[0]?.rol
      : null
  }));
};

/**
 * Obtiene usuarios sin organización asignada
 */
export const getUsuariosSinOrganizacion = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(*)
      )
    `)
    .is("organizacionId", null)
    .eq("estadoUsuario", true)
    .order("nombreUsuario", { ascending: true });
  
  if (error) throw error;
  return data;
};

/**
 * Asigna un usuario a una organización
 */
export const asignarUsuarioAOrganizacion = async (idUsuario, idOrganizacion) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ organizacionId: idOrganizacion })
    .eq("idUsuario", idUsuario)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

