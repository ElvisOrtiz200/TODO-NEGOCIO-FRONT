import { useState, useEffect } from "react";
import * as planService from "../services/planService";

export const usePlanes = (soloActivos = false) => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planService.getPlanes(soloActivos);
      setPlanes(data);
    } catch (err) {
      console.error("Error cargando planes:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanes();
  }, [soloActivos]);

  const addPlan = async (plan) => {
    try {
      const nuevoPlan = await planService.createPlan(plan);
      setPlanes([...planes, nuevoPlan]);
      return { success: true, data: nuevoPlan };
    } catch (err) {
      console.error("Error creando plan:", err);
      return { success: false, error: err.message };
    }
  };

  const editPlan = async (idPlan, plan) => {
    try {
      const planActualizado = await planService.updatePlan(idPlan, plan);
      setPlanes(planes.map((p) => (p.idPlan === idPlan ? planActualizado : p)));
      return { success: true, data: planActualizado };
    } catch (err) {
      console.error("Error actualizando plan:", err);
      return { success: false, error: err.message };
    }
  };

  const removePlan = async (idPlan) => {
    try {
      await planService.deletePlan(idPlan);
      setPlanes(planes.filter((p) => p.idPlan !== idPlan));
      return { success: true };
    } catch (err) {
      console.error("Error eliminando plan:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    planes,
    loading,
    error,
    addPlan,
    editPlan,
    removePlan,
    reloadPlanes: loadPlanes,
  };
};

// Hook para gestionar límites de planes
export const usePlanLimits = (planId) => {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLimits = async () => {
    if (!planId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await planService.getPlanLimits(planId);
      setLimits(data);
    } catch (err) {
      console.error("Error cargando límites:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLimits();
  }, [planId]);

  const saveLimits = async (limitsData) => {
    try {
      const data = await planService.upsertPlanLimits(planId, limitsData);
      setLimits(data);
      return { success: true, data };
    } catch (err) {
      console.error("Error guardando límites:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    limits,
    loading,
    error,
    saveLimits,
    reloadLimits: loadLimits,
  };
};

// Hook para gestionar planes de organizaciones
export const useOrganizacionPlanes = (organizacionId = null) => {
  const [organizacionPlanes, setOrganizacionPlanes] = useState([]);
  const [planActivo, setPlanActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrganizacionPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (organizacionId) {
        const data = await planService.getOrganizacionPlanes(organizacionId);
        setOrganizacionPlanes(data);
        
        try {
          const activo = await planService.getPlanActivoOrganizacion(organizacionId);
          setPlanActivo(activo);
        } catch (err) {
          // Si no hay plan activo, no es un error crítico
          if (err.code !== 'PGRST116') {
            console.warn("No se pudo obtener plan activo:", err);
          }
          setPlanActivo(null);
        }
      } else {
        // Si no hay organizacionId, obtener todos los planes de organizaciones
        const data = await planService.getOrganizacionPlanes(null);
        setOrganizacionPlanes(data);
        setPlanActivo(null);
      }
    } catch (err) {
      console.error("Error cargando planes de organización:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizacionPlanes();
  }, [organizacionId]);

  const asignarPlan = async (organizacionPlan) => {
    try {
      const data = await planService.asignarPlanOrganizacion(organizacionPlan);
      await loadOrganizacionPlanes();
      return { success: true, data };
    } catch (err) {
      console.error("Error asignando plan:", err);
      return { success: false, error: err.message };
    }
  };

  const actualizarPlan = async (idOrganizacionPlan, organizacionPlan) => {
    try {
      const data = await planService.updateOrganizacionPlan(idOrganizacionPlan, organizacionPlan);
      await loadOrganizacionPlanes();
      return { success: true, data };
    } catch (err) {
      console.error("Error actualizando plan:", err);
      return { success: false, error: err.message };
    }
  };

  const cancelarPlan = async (idOrganizacionPlan, motivo) => {
    try {
      const data = await planService.cancelarPlanOrganizacion(idOrganizacionPlan, motivo);
      await loadOrganizacionPlanes();
      return { success: true, data };
    } catch (err) {
      console.error("Error cancelando plan:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    organizacionPlanes,
    planActivo,
    loading,
    error,
    asignarPlan,
    actualizarPlan,
    cancelarPlan,
    reloadPlanes: loadOrganizacionPlanes,
  };
};

// Hook para gestionar historial de planes
export const useHistorialPlanes = (organizacionId = null) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (organizacionId) {
        data = await planService.getHistorialPlanOrganizacion(organizacionId);
      } else {
        data = await planService.getAllHistorialPlanes();
      }
      setHistorial(data);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, [organizacionId]);

  return {
    historial,
    loading,
    error,
    reloadHistorial: loadHistorial,
  };
};
