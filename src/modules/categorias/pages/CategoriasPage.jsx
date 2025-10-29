import { useState } from "react";
import { useCategorias } from "../hooks/useCategorias";
import CategoriaForm from "../components/CategoriaForm";

export default function CategoriasPage() {
  const { categorias, loading, addCategoria, editCategoria, removeCategoria } = useCategorias();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const handleSubmit = async (categoria) => {
    try {
      if (selectedCategoria) {
        await editCategoria(selectedCategoria.idCategoria, categoria);
      } else {
        await addCategoria(categoria);
      }
      setShowForm(false);
      setSelectedCategoria(null);
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Categorías</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedCategoria(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nueva Categoría
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <CategoriaForm
            initialData={selectedCategoria}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedCategoria(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE CATEGORÍAS */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando categorías...</p>
          ) : categorias.length === 0 ? (
            <p className="p-4 text-gray-500">No hay categorías registradas.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#2B3E3C] text-white">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.idCategoria} className="border-b hover:bg-gray-50">
                    <td className="p-2">{cat.idCategoria}</td>
                    <td className="p-2">{cat.nombreCategoria}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          cat.estadoCategoria
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {cat.estadoCategoria ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-2 text-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedCategoria(cat);
                          setShowForm(true);
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeCategoria(cat.idCategoria)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
