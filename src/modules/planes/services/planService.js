import { supabase } from "../../../api/supabaseClient";

const TABLE_PLAN = "PLAN";
const TABLE_ORGANIZACION_PLAN = "ORGANIZACIONPLAN";
const TABLE_ORGANIZACION_PLAN_HISTORIAL = "ORGANIZACIONPLANHISTORIAL";
const TABLE_PLAN_LIMITS = "PLANLIMITES";

// =====================================================
// CRUD PLAN
// =====================================================

/**
 * Obtiene todos los planes (activos e inactivos para superadmin)
 */
export const getPlanes = async (soloActivos = false) => {
  let query = supabase
    .from(TABLE_PLAN)
    .select("*")
    .order("precioPlan", { ascending: true });
  
  if (soloActivos) {
    query = query.eq("estadoPlan", true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Obtiene un plan por ID
 */
export const getPlanById = async (idPlan) => {
  const { data, error } = await supabase
    .from(TABLE_PLAN)
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
    estadoPlan: plan.estadoPlan !== undefined ? plan.estadoPlan : true,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_PLAN)
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
  const planActualizado = {
    ...plan,
    fechaActualizacion: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_PLAN)
    .update(planActualizado)
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
    .from(TABLE_PLAN)
    .update({ 
      estadoPlan: false,
      fechaActualizacion: new Date().toISOString()
    })
    .eq("idPlan", idPlan);
  
  if (error) throw error;
};

// =====================================================
// CRUD PLAN_LIMITS
// =====================================================

/**
 * Obtiene los límites de un plan
 */
export const getPlanLimits = async (planId) => {
  const { data, error } = await supabase
    .from(TABLE_PLAN_LIMITS)
    .select("*")
    .eq("planId", planId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
};

/**
 * Obtiene todos los límites de planes
 */
export const getAllPlanLimits = async () => {
  const { data, error } = await supabase
    .from(TABLE_PLAN_LIMITS)
    .select(`
      *,
      plan:PLAN(*)
    `);
  
  if (error) throw error;
  return data;
};

/**
 * Crea o actualiza los límites de un plan
 */
export const upsertPlanLimits = async (planId, limits) => {
  const limitesData = {
    planId,
    ...limits
  };

  const { data, error } = await supabase
    .from(TABLE_PLAN_LIMITS)
    .upsert(limitesData, { onConflict: 'planId' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Elimina los límites de un plan
 */
export const deletePlanLimits = async (planId) => {
  const { error } = await supabase
    .from(TABLE_PLAN_LIMITS)
    .delete()
    .eq("planId", planId);
  
  if (error) throw error;
};

// =====================================================
// CRUD ORGANIZACION_PLAN
// =====================================================

/**
 * Obtiene todos los planes asignados a organizaciones
 */
export const getOrganizacionPlanes = async (organizacionId = null) => {
  let query = supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .select(`
      *,
      plan:PLAN(*),
      organizacion:ORGANIZACION(*)
    `)
    .order("fechaCreacion", { ascending: false });
  
  if (organizacionId) {
    query = query.eq("organizacionId", organizacionId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Obtiene el plan activo de una organización
 */
export const getPlanActivoOrganizacion = async (organizacionId) => {
  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .select(`
      *,
      plan:PLAN(*)
    `)
    .eq("organizacionId", organizacionId)
    .eq("estado", "activo")
    .order("fechaCreacion", { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  
  // Si hay un plan, obtener los límites por separado
  if (data && data.planId) {
    try {
      const limites = await getPlanLimits(data.planId);
      return {
        ...data,
        limites
      };
    } catch (err) {
      // Si no hay límites, continuar sin ellos
      return data;
    }
  }
  
  return data;
};

/**
 * Obtiene un plan de organización por ID
 */
export const getOrganizacionPlanById = async (idOrganizacionPlan) => {
  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .select(`
      *,
      plan:PLAN(*),
      organizacion:ORGANIZACION(*)
    `)
    .eq("idOrganizacionPlan", idOrganizacionPlan)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Asigna un plan a una organización
 */
export const asignarPlanOrganizacion = async (organizacionPlan) => {
  // Primero, desactivar el plan anterior si existe
  const { error: updateError } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .update({ estado: "inactivo" })
    .eq("organizacionId", organizacionPlan.organizacionId)
    .eq("estado", "activo");
  
  if (updateError) throw updateError;

  // Obtener el precio del plan
  const { data: planData, error: planError } = await supabase
    .from(TABLE_PLAN)
    .select("precioPlan")
    .eq("idPlan", organizacionPlan.planId)
    .single();
  
  if (planError) throw planError;

  // Crear el nuevo plan de organización
  const nuevoOrganizacionPlan = {
    ...organizacionPlan,
    precioContratado: organizacionPlan.precioContratado || planData.precioPlan,
    estado: organizacionPlan.estado || "activo",
    fechaInicio: organizacionPlan.fechaInicio || new Date().toISOString(),
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .insert([nuevoOrganizacionPlan])
    .select(`
      *,
      plan:PLAN(*),
      organizacion:ORGANIZACION(*)
    `)
    .single();
  
  if (error) throw error;

  // El historial se registra automáticamente mediante trigger en la base de datos
  return data;
};

/**
 * Actualiza un plan de organización
 */
export const updateOrganizacionPlan = async (idOrganizacionPlan, organizacionPlan) => {
  const planActualizado = {
    ...organizacionPlan,
    fechaActualizacion: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .update(planActualizado)
    .eq("idOrganizacionPlan", idOrganizacionPlan)
    .select(`
      *,
      plan:PLAN(*),
      organizacion:ORGANIZACION(*)
    `)
    .single();
  
  if (error) throw error;

  // El historial se registra automáticamente mediante trigger en la base de datos
  return data;
};

/**
 * Cancela/desactiva un plan de organización
 */
export const cancelarPlanOrganizacion = async (idOrganizacionPlan, motivo = null) => {
  const { data: planActual, error: fetchError } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .select("*")
    .eq("idOrganizacionPlan", idOrganizacionPlan)
    .single();
  
  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN)
    .update({ 
      estado: "cancelado",
      fechaActualizacion: new Date().toISOString()
    })
    .eq("idOrganizacionPlan", idOrganizacionPlan)
    .select(`
      *,
      plan:PLAN(*),
      organizacion:ORGANIZACION(*)
    `)
    .single();
  
  if (error) throw error;

  // El historial se registra automáticamente mediante trigger en la base de datos
  // El trigger detectará el cambio de estado a "cancelado" y lo registrará
  return data;
};

// =====================================================
// CRUD ORGANIZACION_PLAN_HISTORIAL
// =====================================================

/**
 * Obtiene el historial de planes de una organización
 */
export const getHistorialPlanOrganizacion = async (organizacionId) => {
  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN_HISTORIAL)
    .select(`
      *,
      plan:PLAN(*)
    `)
    .eq("organizacionId", organizacionId)
    .order("fechaAccion", { ascending: false });
  
  if (error) throw error;
  return data;
};

/**
 * Registra una acción en el historial de planes
 */
export const registrarHistorialPlan = async (historial) => {
  // Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  const historialData = {
    ...historial,
    usuarioId: historial.usuarioId || (user ? parseInt(user.id) : null),
    fechaAccion: historial.fechaAccion || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN_HISTORIAL)
    .insert([historialData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Obtiene todo el historial de planes (solo superadmin)
 */
export const getAllHistorialPlanes = async () => {
  const { data, error } = await supabase
    .from(TABLE_ORGANIZACION_PLAN_HISTORIAL)
    .select(`
      *,
      plan:PLAN(*),
      organizacion:ORGANIZACION(*)
    `)
    .order("fechaAccion", { ascending: false });
  
  if (error) throw error;
  return data;
};

