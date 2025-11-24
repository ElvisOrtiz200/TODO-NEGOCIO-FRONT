import { useState, useEffect } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../services/categoriaService";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export const useCategorias = () => {
  const { organizacion } = useOrganizacion();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const idOrganizacion = organizacion?.idOrganizacion || null;
      const data = await getCategorias(idOrganizacion);
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategoria = async (categoria) => {
    // Agregar idOrganizacion si no está presente
    if (!categoria.idOrganizacion && organizacion?.idOrganizacion) {
      categoria.idOrganizacion = organizacion.idOrganizacion;
    }
    const nueva = await createCategoria(categoria);
    setCategorias([...categorias, nueva]);
  };

  const editCategoria = async (idCategoria, categoria) => {
    const actualizada = await updateCategoria(idCategoria, categoria);
    setCategorias(categorias.map((c) => (c.idCategoria === idCategoria ? actualizada : c)));
  };

  const removeCategoria = async (idCategoria) => {
    await deleteCategoria(idCategoria);
    setCategorias(categorias.filter((c) => c.idCategoria !== idCategoria));
  };

  useEffect(() => {
    if (organizacion?.idOrganizacion) {
      loadCategorias();
    }
  }, [organizacion?.idOrganizacion]);

  return { categorias, loading, addCategoria, editCategoria, removeCategoria };
};
