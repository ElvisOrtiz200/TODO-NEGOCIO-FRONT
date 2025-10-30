import { useState } from "react";
import { useTipoMovimientos } from "../hooks/useTipoMovimientos";
import TipoMovimientoForm from "../components/TipoMovimientoForm";

export default function TipoMovimientosPage() {
  const {
    tipoMovimientos,
    loading,
    addTipoMovimiento,
    editTipoMovimiento,
    removeTipoMovimiento,
  } = useTipoMovimientos();

  const [showForm, setShowForm] = useState(false);
  const [selectedTipoMovimiento, setSelectedTipoMovimiento] = useState(null);

  const handleSubmit = async (tipoMovimiento) => {
    try {
      if (selectedTipoMovimiento) {
        await editTipoMovimiento(selectedTipoMovimiento.idTipoMovimiento, tipoMovimiento);
      } else {
        await addTipoMovimiento(tipoMovimiento);
      }
      setShowForm(false);
      setSelectedTipoMovimiento(null);
    } catch (error) {
      console.error("Error al guardar el tipo de movimiento:", error);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">
          Gestión de Tipos de Movimiento
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedTipoMovimiento(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nuevo Tipo de Movimiento
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <TipoMovimientoForm
            initialData={selectedTipoMovimiento}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedTipoMovimiento(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE TIPOS DE MOVIMIENTO */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando tipos de movimiento...</p>
          ) : tipoMovimientos.length === 0 ? (
            <p className="p-4 text-gray-500">
              No hay tipos de movimiento registrados.
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#2B3E3C] text-white">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Descripción</th>
                  <th className="p-2 text-left">Naturaleza</th>
                  <th className="p-2 text-left">Fecha Registro</th>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tipoMovimientos.map((tm) => (
                  <tr key={tm.idTipoMovimiento} className="border-b hover:bg-gray-50">
                    <td className="p-2">{tm.idTipoMovimiento}</td>
                    <td className="p-2">{tm.descripcionMovimiento}</td>
                    <td className="p-2">{tm.naturaleza}</td>
                    <td className="p-2">
                      {new Date(tm.fechaRegistroMovimiento).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tm.estadoMovimiento
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tm.estadoMovimiento ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-2 text-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedTipoMovimiento(tm);
                          setShowForm(true);
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeTipoMovimiento(tm.idTipoMovimiento)}
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
