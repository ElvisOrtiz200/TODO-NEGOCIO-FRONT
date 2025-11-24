import { supabase } from "../../../api/supabaseClient";

const TABLE = "PERMISO";

export const getPermisos = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoPermiso", true)
    .order("idPermiso", { ascending: true });
  if (error) throw error;
  return data;
};

export const createPermiso = async (permiso) => {
  try {
    console.log("📝 Creando permiso en Supabase:", permiso);
    
    const permisoData = {
      ...permiso,
      estadoPermiso: permiso.estadoPermiso !== undefined ? permiso.estadoPermiso : true,
    };
    
    const { data, error } = await supabase
      .from(TABLE)
      .insert([permisoData])
      .select();
    
    if (error) {
      console.error("❌ Error de Supabase al crear permiso:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error("❌ No se retornó ningún dato al crear permiso");
      throw new Error("No se pudo crear el permiso. No se retornaron datos.");
    }
    
    console.log("✅ Permiso creado exitosamente:", data[0]);
    return data[0];
  } catch (error) {
    console.error("❌ Error en createPermiso:", error);
    throw error;
  }
};

export const updatePermiso = async (idPermiso, permiso) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(permiso)
    .eq("idPermiso", idPermiso)
    .select();
  if (error) throw error;
  return data[0];
};

export const deletePermiso = async (idPermiso) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoPermiso: false })
    .eq("idPermiso", idPermiso);
  if (error) throw error;
};

