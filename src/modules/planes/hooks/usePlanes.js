import { useState, useEffect } from "react";
import * as planService from "../services/planService";

export const usePlanes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planService.getPlanes();
      setPlanes(data);
    } catch (err) {
      console.error("Error cargando planes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanes();
  }, []);

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
