
import { useState, useMemo } from "react";
import { useClientes } from "../hooks/useClientes";
import ClienteForm from "../components/ClienteForm";
import { useToast } from "../../../components/ToastContainer";
import { usePermissions } from "../../../hooks/usePermissions";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import PermisoGuard from "../../../components/PermisoGuard";

export default function ClientesPage() {
  const { clientes, loading, addCliente, editCliente, removeCliente, loadClientes } = useClientes();
  const { success, error: showError, warning } = useToast();
  const { isSuperAdmin, tienePermiso, loading: permissionsLoading } = usePermissions();
  const { organizacionVista } = useOrganizacion();
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Determinar permisos
  const puedeCrear = isSuperAdmin || tienePermiso("clientes.crear");
  const puedeEditar = isSuperAdmin || tienePermiso("clientes.editar");
  const puedeEliminar = isSuperAdmin || tienePermiso("clientes.eliminar");
  const puedeVer = isSuperAdmin || tienePermiso("clientes.ver");

  const handleSubmit = async (cliente) => {
    try {
      console.log("🔄 Iniciando guardado de cliente:", cliente);
      
      if (selectedCliente) {
        console.log("✏️ Editando cliente:", selectedCliente.idCliente);
        await editCliente(selectedCliente.idCliente, cliente);
        success("Cliente actualizado exitosamente");
      } else {
        console.log("➕ Creando nuevo cliente");
        await addCliente(cliente);
        success("Cliente creado exitosamente");
      }
      
      // Recargar la lista
      await loadClientes();
      setShowForm(false);
      setSelectedCliente(null);
    } catch (error) {
      console.error("❌ Error al guardar el cliente:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el cliente";
      showError(errorMsg);
    }
  };

  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const nombreCompleto = `${cliente.nombreCliente || ""} ${cliente.apellidoCliente || ""}`.toLowerCase();
      const coincideNombre = filtroNombre === "" || 
        nombreCompleto.includes(filtroNombre.toLowerCase()) ||
        cliente.nombreCliente?.toLowerCase().includes(filtroNombre.toLowerCase()) ||
        cliente.apellidoCliente?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideEmail = filtroEmail === "" || 
        cliente.emailCliente?.toLowerCase().includes(filtroEmail.toLowerCase());
      const coincideTelefono = filtroTelefono === "" || 
        cliente.telefonoCliente?.includes(filtroTelefono);
      const coincideDocumento = filtroDocumento === "" || 
        cliente.documentoCliente?.includes(filtroDocumento);
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && cliente.estadoCliente) ||
        (filtroEstado === "inactivo" && !cliente.estadoCliente);
      
      return coincideNombre && coincideEmail && coincideTelefono && coincideDocumento && coincideEstado;
    });
  }, [clientes, filtroNombre, filtroEmail, filtroTelefono, filtroDocumento, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEmail("");
    setFiltroTelefono("");
    setFiltroDocumento("");
    setFiltroEstado("todos");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroEmail !== "" || filtroTelefono !== "" || 
    filtroDocumento !== "" || filtroEstado !== "todos";

  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!puedeVer) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p>No tienes permisos para ver los clientes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">Gestión de Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : (
              <span>Administra la información de tus clientes</span>
            )}
          </p>
        </div>
        {!showForm && puedeCrear && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedCliente(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Cliente
          </button>
        )}
      </div>

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && puedeCrear && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedCliente ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <ClienteForm
            initialData={selectedCliente}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedCliente(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* FILTROS */}
          <div className="bg-white rounded-xl shadow p-4 mb-6 border-l-4 border-[#2B3E3C]">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#2B3E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-semibold text-[#2B3E3C]">Filtros de Búsqueda</h3>
              {tieneFiltrosActivos && (
                <span className="ml-auto text-sm text-gray-600">
                  {clientesFiltrados.length} de {clientes.length} clientes
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre o apellido..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 Email
                </label>
                <input
                  type="text"
                  value={filtroEmail}
                  onChange={(e) => setFiltroEmail(e.target.value)}
                  placeholder="Buscar por email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📞 Teléfono
                </label>
                <input
                  type="text"
                  value={filtroTelefono}
                  onChange={(e) => setFiltroTelefono(e.target.value)}
                  placeholder="Buscar por teléfono..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🆔 Documento
                </label>
                <input
                  type="text"
                  value={filtroDocumento}
                  onChange={(e) => setFiltroDocumento(e.target.value)}
                  placeholder="DNI, RUC, etc..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📊 Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>

            {tieneFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                🗑️ Limpiar Filtros
              </button>
            )}
          </div>

          {/* TABLA DE CLIENTES */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
                <p className="mt-4 text-gray-500">Cargando clientes...</p>
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>
                  {tieneFiltrosActivos 
                    ? "No se encontraron clientes con los filtros aplicados." 
                    : "No hay clientes registrados."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2B3E3C] text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nombre Completo</th>
                      <th className="p-3 text-left">Documento</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Teléfono</th>
                      <th className="p-3 text-left">Dirección</th>
                      <th className="p-3 text-left">Estado</th>
                      {!organizacionVista && (
                        <th className="p-3 text-center">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.idCliente} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">{cliente.idCliente}</td>
                        <td className="p-3 font-medium">
                          {cliente.nombreCliente} {cliente.apellidoCliente || ""}
                        </td>
                        <td className="p-3">{cliente.documentoCliente || "-"}</td>
                        <td className="p-3">{cliente.emailCliente || "-"}</td>
                        <td className="p-3">{cliente.telefonoCliente || "-"}</td>
                        <td className="p-3">{cliente.direccionCliente || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              cliente.estadoCliente
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {cliente.estadoCliente ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        {!organizacionVista && (
                          <td className="p-3 text-center space-x-3">
                            {puedeEditar && (
                              <button
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                              >
                                Editar
                              </button>
                            )}
                            {puedeEliminar && (
                              <button
                                onClick={async () => {
                                  if (window.confirm(`¿Estás seguro de eliminar el cliente "${cliente.nombreCliente} ${cliente.apellidoCliente || ""}"?`)) {
                                    try {
                                      await removeCliente(cliente.idCliente);
                                      await loadClientes();
                                      success("Cliente eliminado exitosamente");
                                    } catch (error) {
                                      showError("Error al eliminar el cliente");
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                              >
                                Eliminar
                              </button>
                            )}
                            {!puedeEditar && !puedeEliminar && (
                              <span className="text-gray-400 text-sm">Solo lectura</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}