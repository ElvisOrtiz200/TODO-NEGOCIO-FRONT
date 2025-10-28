import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import RolForm from "../components/RolForm";

export default function RolesPage() {
  const { roles, loading, addRol, editRol, removeRol } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);

  const handleSubmit = async (rol) => {
    try {
      if (selectedRol) {
        await editRol(selectedRol.idRol, rol);
      } else {
        await addRol(rol);
      }
      setShowForm(false);
      setSelectedRol(null);
    } catch (error) {
      console.error("Error al guardar el rol:", error);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Roles</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedRol(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f]"
          >
            + Nuevo Rol
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <RolForm
            initialData={selectedRol}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedRol(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE ROLES */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando roles...</p>
          ) : roles.length === 0 ? (
            <p className="p-4 text-gray-500">No hay roles registrados.</p>
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
                {roles.map((rol) => (
                  <tr key={rol.idRol} className="border-b hover:bg-gray-50">
                    <td className="p-2">{rol.idRol}</td>
                    <td className="p-2">{rol.nombreRol}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rol.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {rol.estadoRol ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-2 text-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedRol(rol);
                          setShowForm(true);
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeRol(rol.idRol)}
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
