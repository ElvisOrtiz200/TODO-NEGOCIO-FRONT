import { supabase } from "../../../api/supabaseClient";

const TABLE = "ROL";

/**
 * Obtiene todos los roles activos
 */
export const getRoles = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoRol", true)
    .order("idRol", { ascending: true });
  if (error) throw error;
  return data;
};

/**
 * Obtiene un rol por ID con sus permisos
 */
export const getRolById = async (idRol) => {
  // Primero obtener el rol
  const { data: rolData, error: rolError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idRol", idRol)
    .eq("estadoRol", true)
    .single();
  
  if (rolError) throw rolError;
  if (!rolData) return null;

  // Luego obtener los permisos del rol
  const { data: permisosData, error: permisosError } = await supabase
    .from("ROLPERMISO")
    .select(`
      estadoRolPermiso,
      permiso:PERMISO(*)
    `)
    .eq("idRol", idRol)
    .eq("estadoRolPermiso", true);

  if (permisosError) {
    console.warn("Error obteniendo permisos del rol:", permisosError);
  }

  // Combinar los datos
  return {
    ...rolData,
    permisos: permisosData || []
  };
};

/**
 * Crea un nuevo rol
 */
export const createRol = async (rol) => {
  try {
    const rolData = {
      ...rol,
      fechaRegistroRol: new Date().toISOString(),
      estadoRol: true,
    };
    
    console.log("📝 Creando rol con datos:", rolData);
    
    const { data, error } = await supabase
      .from(TABLE)
      .insert([rolData])
      .select();
    
    if (error) {
      console.error("❌ Error de Supabase al crear rol:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("❌ No se retornó ningún dato al crear rol");
      throw new Error("No se pudo crear el rol. No se retornaron datos.");
    }
    
    console.log("✅ Rol creado exitosamente:", data[0]);
    return data[0];
  } catch (error) {
    console.error("❌ Error en createRol:", error);
    throw error;
  }
};

/**
 * Actualiza un rol
 */
export const updateRol = async (idRol, rol) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(rol)
    .eq("idRol", idRol)
    .select();
  if (error) throw error;
  return data[0];
};

/**
 * Elimina (desactiva) un rol
 */
export const deleteRol = async (idRol) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoRol: false })
    .eq("idRol", idRol);
  if (error) throw error;
};

