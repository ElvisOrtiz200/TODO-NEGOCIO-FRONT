import { useState, useEffect } from "react";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../services/categoriaService";

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategoria = async (categoria) => {
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
    loadCategorias();
  }, []);

  return { categorias, loading, addCategoria, editCategoria, removeCategoria };
};
