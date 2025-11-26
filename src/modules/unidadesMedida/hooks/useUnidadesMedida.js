import { useState, useEffect } from "react";
import {
  getUnidadesMedida,
  createUnidadMedida,
  updateUnidadMedida,
  deleteUnidadMedida,
} from "../services/unidadMedidaService";

export const useUnidadesMedida = () => {
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUnidadesMedida = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando unidades de medida...");
      const data = await getUnidadesMedida();
      console.log("✅ Unidades de medida cargadas:", data);
      setUnidadesMedida(data || []);
    } catch (err) {
      console.error("❌ Error al cargar unidades de medida:", err);
      console.error("Error completo:", err.message, err.code, err.details);
      setUnidadesMedida([]);
    } finally {
      setLoading(false);
    }
  };

  const addUnidadMedida = async (unidadMedida) => {
    try {
      console.log("📝 Creando unidad de medida con datos:", unidadMedida);
      const nueva = await createUnidadMedida(unidadMedida);
      console.log("✅ Unidad de medida creada exitosamente:", nueva);
      await loadUnidadesMedida();
      return nueva;
    } catch (err) {
      console.error("❌ Error creando unidad de medida:", err);
      throw err;
    }
  };

  const editUnidadMedida = async (idUnidadMedida, unidadMedida) => {
    try {
      console.log("✏️ Actualizando unidad de medida:", idUnidadMedida, unidadMedida);
      const actualizada = await updateUnidadMedida(idUnidadMedida, unidadMedida);
      console.log("✅ Unidad de medida actualizada exitosamente:", actualizada);
      await loadUnidadesMedida();
      return actualizada;
    } catch (err) {
      console.error("❌ Error actualizando unidad de medida:", err);
      throw err;
    }
  };

  const removeUnidadMedida = async (idUnidadMedida) => {
    try {
      console.log("🗑️ Eliminando unidad de medida:", idUnidadMedida);
      await deleteUnidadMedida(idUnidadMedida);
      await loadUnidadesMedida();
    } catch (err) {
      console.error("❌ Error eliminando unidad de medida:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadUnidadesMedida();
  }, []);

  return {
    unidadesMedida,
    loading,
    addUnidadMedida,
    editUnidadMedida,
    removeUnidadMedida,
    loadUnidadesMedida,
  };
};

