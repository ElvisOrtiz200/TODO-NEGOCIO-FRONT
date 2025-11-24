import { supabase } from "../../../api/supabaseClient";

const TABLE = "PLAN";

/**
 * Obtiene todos los planes activos
 */
export const getPlanes = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("estadoPlan", true)
    .order("precioPlan", { ascending: true });
  
  if (error) throw error;
  return data;
};

/**
 * Obtiene un plan por ID
 */
export const getPlanById = async (idPlan) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("idPlan", idPlan)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Crea un nuevo plan
 */
export const createPlan = async (plan) => {
  const nuevoPlan = {
    ...plan,
    estadoPlan: true,
    fechaCreacion: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert([nuevoPlan])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Actualiza un plan
 */
export const updatePlan = async (idPlan, plan) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(plan)
    .eq("idPlan", idPlan)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Elimina (desactiva) un plan
 */
export const deletePlan = async (idPlan) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoPlan: false })
    .eq("idPlan", idPlan);
  
  if (error) throw error;
};

