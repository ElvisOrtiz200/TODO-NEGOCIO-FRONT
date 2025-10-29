import { useState } from "react";
import { useAlmacenes } from "../hooks/useAlmacenes";
import AlmacenForm from "../components/AlmacenForm";

export default function AlmacenesPage() {
  const { almacenes, loading, addAlmacen, editAlmacen, removeAlmacen } = useAlmacenes();
  const [showForm, setShowForm] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);

  const handleSubmit = async (almacen) => {
    try {
      if (selectedAlmacen) {
        await editAlmacen(selectedAlmacen.idAlmacen, almacen);
      } else {
        await addAlmacen(almacen);
      }
      setShowForm(false);
      setSelectedAlmacen(null);
    } catch (error) {
      console.error("Error al guardar el almacén:", error);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Almacenes</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedAlmacen(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nuevo Almacén
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <AlmacenForm
            initialData={selectedAlmacen}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedAlmacen(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE ALMACENES */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando almacenes...</p>
          ) : almacenes.length === 0 ? (
            <p className="p-4 text-gray-500">No hay almacenes registrados.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#2B3E3C] text-white">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Ubicación</th>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {almacenes.map((alm) => (
                  <tr key={alm.idAlmacen} className="border-b hover:bg-gray-50">
                    <td className="p-2">{alm.idAlmacen}</td>
                    <td className="p-2">{alm.nombreAlmacen}</td>
                    <td className="p-2">{alm.ubicacionAlmacen}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          alm.estadoAlmacen
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {alm.estadoAlmacen ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-2 text-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedAlmacen(alm);
                          setShowForm(true);
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeAlmacen(alm.idAlmacen)}
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
