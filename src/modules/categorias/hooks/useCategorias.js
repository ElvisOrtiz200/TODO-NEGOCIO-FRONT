import { useState, useEffect } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../services/categoriaService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useCategorias = () => {
  const { organizacion, organizacionVista } = useOrganizacion();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const orgActiva = organizacionVista || organizacion;
      const idOrganizacion = orgActiva?.idOrganizacion || null;
      // Cargar todas las categorías (activas e inactivas) para que el filtro funcione
      const data = await getCategorias(idOrganizacion, true);
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategoria = async (categoria) => {
    try {
      // Agregar idOrganizacion si no está presente
      const orgActiva = organizacionVista || organizacion;
      if (!categoria.idOrganizacion && orgActiva?.idOrganizacion) {
        categoria.idOrganizacion = orgActiva.idOrganizacion;
      }
      console.log("📝 Creando categoría con datos:", categoria);
      const nueva = await createCategoria(categoria);
      console.log("✅ Categoría creada exitosamente:", nueva);
      // Recargar la lista completa para asegurar sincronización
      await loadCategorias();
      return nueva;
    } catch (err) {
      console.error("❌ Error creando categoría:", err);
      throw err;
    }
  };

  const editCategoria = async (idCategoria, categoria) => {
    try {
      console.log("✏️ Actualizando categoría:", idCategoria, categoria);
      const actualizada = await updateCategoria(idCategoria, categoria);
      console.log("✅ Categoría actualizada exitosamente:", actualizada);
      // Recargar la lista completa para asegurar sincronización
      await loadCategorias();
      return actualizada;
    } catch (err) {
      console.error("❌ Error actualizando categoría:", err);
      throw err;
    }
  };

  const removeCategoria = async (idCategoria) => {
    try {
      console.log("🗑️ Eliminando categoría:", idCategoria);
      await deleteCategoria(idCategoria);
      // Recargar la lista completa para asegurar sincronización
      await loadCategorias();
    } catch (err) {
      console.error("❌ Error eliminando categoría:", err);
      throw err;
    }
  };

  useEffect(() => {
    const orgActiva = organizacionVista || organizacion;
    if (orgActiva?.idOrganizacion) {
      loadCategorias();
    }
  }, [organizacion?.idOrganizacion, organizacionVista?.idOrganizacion]);

  return { categorias, loading, addCategoria, editCategoria, removeCategoria, loadCategorias };
};
