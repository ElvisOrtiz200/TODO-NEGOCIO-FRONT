import { supabase } from "../../../api/supabaseClient";

const TABLE = "USUARIO";

/**
 * Obtiene todos los usuarios activos de una organización
 * Si organizacionId es null, obtiene todos los usuarios (para superadmin)
 */
export const getUsuarios = async (organizacionId = null) => {
  // Siempre usar LEFT JOIN para obtener usuarios con o sin roles
  // Luego filtrar en memoria según sea necesario
  // Asegurar que organizacionId sea string para comparaciones UUID
  const orgId = organizacionId ? String(organizacionId) : null;
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      organizacion:ORGANIZACION!USUARIO_organizacionId_fkey(*),
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(*)
      )
    `)
    .eq("estadoUsuario", true);
  if (orgId) {
    query = query.eq("organizacionId", orgId);
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
      organizacion:ORGANIZACION!USUARIO_organizacionId_fkey(*),
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
      organizacion:ORGANIZACION!USUARIO_organizacionId_fkey(*),
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

  const nuevoUsuario = {
    ...datosUsuario,
    estadoUsuario: true,
    fechaCreacion: new Date().toISOString()
  };

  // Intentar insertar el usuario
  let { data, error } = await supabase
    .from(TABLE)
    .insert([nuevoUsuario])
    .select(`
      *,
      organizacion:ORGANIZACION!USUARIO_organizacionId_fkey(*)
    `)
    .single();

  // Si el error es por duplicado (usuario ya existe), lanzar error con mensaje claro
  if (error && error.code === "23505") {
    const email = datosUsuario.emailUsuario || datosUsuario.authUserId || 'este email';
    const errorMessage = `El usuario con email ${email} ya existe en el sistema. Por favor, usa la opción 'Buscar Usuario Existente' para agregarlo a la organización.`;
    const duplicateError = new Error(errorMessage);
    duplicateError.code = "23505";
    duplicateError.details = "Usuario duplicado";
    throw duplicateError;
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
  console.log("🔍 [updateUsuario] Iniciando actualización:");
  console.log("  - idUsuario recibido:", idUsuario, "tipo:", typeof idUsuario);
  console.log("  - usuario recibido:", usuario);

  // Extraer roles del objeto usuario
  const { rolId, roles, ...datosUsuario } = usuario;

  // Asegurar que idUsuario sea un número (BIGINT)
  const idUsuarioNum = typeof idUsuario === 'string' ? parseInt(idUsuario, 10) : idUsuario;
  console.log("  - idUsuario convertido:", idUsuarioNum, "tipo:", typeof idUsuarioNum);

  // Limpiar datosUsuario: asegurar tipos correctos
  const datosLimpios = { ...datosUsuario };

  // Asegurar que organizacionId sea string (UUID) o null
  if (datosLimpios.organizacionId !== undefined && datosLimpios.organizacionId !== null) {
    datosLimpios.organizacionId = String(datosLimpios.organizacionId);
    console.log("  - organizacionId convertido a string:", datosLimpios.organizacionId);
  }

  // Asegurar que authUserId sea string (UUID) o null
  if (datosLimpios.authUserId !== undefined && datosLimpios.authUserId !== null) {
    datosLimpios.authUserId = String(datosLimpios.authUserId);
    console.log("  - authUserId convertido a string:", datosLimpios.authUserId);
  }

  // Remover idUsuario de datosLimpios si está presente (no se debe actualizar)
  delete datosLimpios.idUsuario;

  console.log("  - datosLimpios para actualizar:", datosLimpios);

  await supabase
    .from(TABLE)
    .update(datosLimpios)
    .eq("idUsuario", idUsuarioNum);

  const { data, error } = await supabase
    .from(TABLE)
    .select(`
    *,
    organizacion:ORGANIZACION!USUARIO_organizacionId_fkey(*)
  `)
    .eq("idUsuario", idUsuarioNum)
    .single();


  if (error) {
    console.error("❌ [updateUsuario] Error en la actualización:", error);
    console.error("  - Código de error:", error.code);
    console.error("  - Mensaje:", error.message);
    console.error("  - Detalles:", error.details);
    console.error("  - Hint:", error.hint);
    throw error;
  }

  console.log("✅ [updateUsuario] Usuario actualizado exitosamente:", data);

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
      organizacion:ORGANIZACION!USUARIO_organizacionId_fkey(*),
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
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const idOrg = idOrganizacion ? String(idOrganizacion) : null;
  const { data, error } = await supabase
    .from(TABLE)
    .update({ organizacionId: idOrg })
    .eq("idUsuario", idUsuario)
    .select()
    .single();

  if (error) throw error;
  return data;
};

