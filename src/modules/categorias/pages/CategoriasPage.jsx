import { useState } from "react";
import { useCategorias } from "../hooks/useCategorias";
import CategoriaForm from "../components/CategoriaForm";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export default function CategoriasPage() {
  const { categorias, loading, addCategoria, editCategoria, removeCategoria } = useCategorias();
  const { organizacionVista } = useOrganizacion();
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
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra las categorías de productos</span>
            )}
          </p>
        </div>
        {!showForm && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedCategoria(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nueva Categoría
          </button>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
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
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Estado</th>
                  {!organizacionVista && (
                    <th className="p-3 text-center">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.idCategoria} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">{cat.idCategoria}</td>
                    <td className="p-3 font-medium">{cat.nombreCategoria}</td>
                    <td className="p-3">
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
                    {!organizacionVista && (
                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedCategoria(cat);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removeCategoria(cat.idCategoria)}
                          className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
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
