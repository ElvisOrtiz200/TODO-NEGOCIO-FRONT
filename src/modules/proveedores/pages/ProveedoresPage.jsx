import { useState, useMemo } from "react";
import { useProveedores } from "../hooks/useProveedores";
import ProveedorForm from "../components/ProveedorForm";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { RolGuard } from "../../../components/PermisoGuard";
import { useToast } from "../../../components/ToastContainer";

export default function ProveedorPage() {
  const { proveedores, loading, addProveedor, editProveedor, removeProveedor, loadProveedores } =
    useProveedores();
  const { success, error: showError } = useToast();
  const { organizacionVista } = useOrganizacion();
  const [showForm, setShowForm] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroNombreComercial, setFiltroNombreComercial] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [filtroTipoDocumento, setFiltroTipoDocumento] = useState("todos");
  const [filtroTelefono, setFiltroTelefono] = useState("");
  const [filtroCorreo, setFiltroCorreo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const handleSubmit = async (proveedor) => {
    try {
      console.log("🔄 Iniciando guardado de proveedor:", proveedor);
      
      if (selectedProveedor) {
        console.log("✏️ Editando proveedor:", selectedProveedor.idProveedor);
        await editProveedor(selectedProveedor.idProveedor, proveedor);
        success("Proveedor actualizado exitosamente");
      } else {
        console.log("➕ Creando nuevo proveedor");
        await addProveedor(proveedor);
        success("Proveedor creado exitosamente");
      }
      
      // Recargar la lista
      await loadProveedores();
      setShowForm(false);
      setSelectedProveedor(null);
    } catch (error) {
      console.error("❌ Error al guardar el proveedor:", error);
      const errorMsg = error?.message || error?.toString() || "Error desconocido al guardar el proveedor";
      showError(errorMsg);
    }
  };

  // Obtener tipos de documento únicos para el filtro
  const tiposDocumentoUnicos = useMemo(() => {
    const tipos = proveedores
      .map(p => p.tipoDocumento)
      .filter(Boolean)
      .filter((tipo, index, self) => index === self.indexOf(tipo));
    return tipos;
  }, [proveedores]);

  // Filtrar proveedores
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((proveedor) => {
      const coincideNombre = filtroNombre === "" || 
        proveedor.nombre?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideNombreComercial = filtroNombreComercial === "" || 
        proveedor.nombreComercial?.toLowerCase().includes(filtroNombreComercial.toLowerCase());
      const coincideDocumento = filtroDocumento === "" || 
        proveedor.numeroDocumento?.toLowerCase().includes(filtroDocumento.toLowerCase());
      const coincideTipoDocumento = filtroTipoDocumento === "todos" || 
        proveedor.tipoDocumento === filtroTipoDocumento;
      const coincideTelefono = filtroTelefono === "" || 
        proveedor.telefono?.toLowerCase().includes(filtroTelefono.toLowerCase());
      const coincideCorreo = filtroCorreo === "" || 
        proveedor.correo?.toLowerCase().includes(filtroCorreo.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && proveedor.estado) ||
        (filtroEstado === "inactivo" && !proveedor.estado);
      
      return coincideNombre && coincideNombreComercial && coincideDocumento && 
             coincideTipoDocumento && coincideTelefono && coincideCorreo && coincideEstado;
    });
  }, [proveedores, filtroNombre, filtroNombreComercial, filtroDocumento, filtroTipoDocumento, filtroTelefono, filtroCorreo, filtroEstado]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroNombreComercial("");
    setFiltroDocumento("");
    setFiltroTipoDocumento("todos");
    setFiltroTelefono("");
    setFiltroCorreo("");
    setFiltroEstado("todos");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroNombreComercial !== "" || 
    filtroDocumento !== "" || filtroTipoDocumento !== "todos" || filtroTelefono !== "" || 
    filtroCorreo !== "" || filtroEstado !== "todos";

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
          <RolGuard rol="ADMINISTRADOR">
            <button
              onClick={() => {
                setShowForm(true);
                setSelectedProveedor(null);
              }}
              className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
            >
              + Nuevo Proveedor
            </button>
          </RolGuard>
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
                  {proveedoresFiltrados.length} de {proveedores.length} proveedores
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre del proveedor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Nombre Comercial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏢 Nombre Comercial
                </label>
                <input
                  type="text"
                  value={filtroNombreComercial}
                  onChange={(e) => setFiltroNombreComercial(e.target.value)}
                  placeholder="Nombre comercial..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Tipo de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📄 Tipo de Documento
                </label>
                <select
                  value={filtroTipoDocumento}
                  onChange={(e) => setFiltroTipoDocumento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos los tipos</option>
                  {tiposDocumentoUnicos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Número de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🆔 Número de Documento
                </label>
                <input
                  type="text"
                  value={filtroDocumento}
                  onChange={(e) => setFiltroDocumento(e.target.value)}
                  placeholder="Buscar por documento..."
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

              {/* Filtro por Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 Correo Electrónico
                </label>
                <input
                  type="text"
                  value={filtroCorreo}
                  onChange={(e) => setFiltroCorreo(e.target.value)}
                  placeholder="Buscar por correo..."
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

          {/* TABLA DE PROVEEDORES */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
                <p className="mt-4 text-gray-500">Cargando proveedores...</p>
              </div>
            ) : proveedoresFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>
                  {tieneFiltrosActivos 
                    ? "No se encontraron proveedores con los filtros aplicados." 
                    : "No hay proveedores registrados."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2B3E3C] text-white">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Nombre Comercial</th>
                      <th className="p-3 text-left">Documento</th>
                      <th className="p-3 text-left">Teléfono</th>
                      <th className="p-3 text-left">Correo</th>
                      <th className="p-3 text-left">Estado</th>
                      {!organizacionVista && (
                        <th className="p-3 text-center">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {proveedoresFiltrados.map((p) => (
                    <tr key={p.idProveedor} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{p.idProveedor}</td>
                      <td className="p-3 font-medium">{p.nombre || "-"}</td>
                      <td className="p-3 text-gray-600">{p.nombreComercial || "-"}</td>
                      <td className="p-3">
                        {p.tipoDocumento && p.numeroDocumento ? (
                          <span className="text-sm">
                            {p.tipoDocumento}: {p.numeroDocumento}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-gray-600">{p.telefono || "-"}</td>
                      <td className="p-3 text-gray-600">{p.correo || "-"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.estado
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {!organizacionVista && (
                        <RolGuard rol="ADMINISTRADOR">
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
                              onClick={async () => {
                                if (window.confirm(`¿Estás seguro de eliminar el proveedor "${p.nombre || p.nombreComercial}"?`)) {
                                  try {
                                    await removeProveedor(p.idProveedor);
                                    await loadProveedores();
                                    success("Proveedor eliminado exitosamente");
                                  } catch (error) {
                                    showError("Error al eliminar el proveedor");
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </td>
                        </RolGuard>
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
