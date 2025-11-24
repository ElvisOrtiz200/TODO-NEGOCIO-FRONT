import { useState } from "react";
import { useProveedores } from "../hooks/useProveedores";
import ProveedorForm from "../components/ProveedorForm";
import { useOrganizacion } from "../../../context/OrganizacionContext";

export default function ProveedorPage() {
  const { proveedores, loading, addProveedor, editProveedor, removeProveedor } = useProveedores();
  const { organizacionVista } = useOrganizacion();
  const [showForm, setShowForm] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);

  const handleSubmit = async (proveedor) => {
    try {
      if (selectedProveedor) {
        await editProveedor(selectedProveedor.idProveedor, proveedor);
      } else {
        await addProveedor(proveedor);
      }
      setShowForm(false);
      setSelectedProveedor(null);
    } catch (error) {
      console.error("Error al guardar el proveedor:", error);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">
            Gestión de Proveedores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra la información de tus proveedores</span>
            )}
          </p>
        </div>
        {!showForm && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedProveedor(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Proveedor
          </button>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <ProveedorForm
            initialData={selectedProveedor}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedProveedor(null);
            }}
          />
        </div>
      ) : (
        /* TABLA DE PROVEEDORES */
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500">Cargando proveedores...</p>
          ) : proveedores.length === 0 ? (
            <p className="p-4 text-gray-500">No hay proveedores registrados.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#2B3E3C] text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Teléfono</th>
                  <th className="p-3 text-left">Estado</th>
                  {!organizacionVista && (
                    <th className="p-3 text-center">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.idProveedor} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">{p.idProveedor}</td>
                    <td className="p-3 font-medium">{p.nombreProveedor}</td>
                    <td className="p-3 text-gray-600">{p.telefonoProveedor}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.estadoProveedor
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.estadoProveedor ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {!organizacionVista && (
                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedProveedor(p);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removeProveedor(p.idProveedor)}
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
