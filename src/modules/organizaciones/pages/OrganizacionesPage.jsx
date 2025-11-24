import { useState, useMemo } from "react";
import { useOrganizaciones } from "../hooks/useOrganizaciones";
import OrganizacionForm from "../components/OrganizacionForm";
import AsignarUsuariosModal from "../components/AsignarUsuariosModal";
import { getUsuariosOrganizacion } from "../services/organizacionService";
import SuperAdminRoute from "../../../components/SuperAdminRoute";
import { useToast } from "../../../components/ToastContainer";

function OrganizacionesPageContent() {
  const { organizaciones, loading, error, addOrganizacion, editOrganizacion, removeOrganizacion, reloadOrganizaciones } = useOrganizaciones();
  const { success, error: showError } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedOrganizacion, setSelectedOrganizacion] = useState(null);
  const [showAsignarUsuarios, setShowAsignarUsuarios] = useState(false);
  const [organizacionParaUsuarios, setOrganizacionParaUsuarios] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPlan, setFiltroPlan] = useState("todos");
  const [filtroCodigo, setFiltroCodigo] = useState("");

  const handleSubmit = async (organizacion) => {
    try {
      if (selectedOrganizacion) {
        const resultado = await editOrganizacion(selectedOrganizacion.idOrganizacion, organizacion);
        if (resultado.success) {
          await reloadOrganizaciones();
          setShowForm(false);
          setSelectedOrganizacion(null);
          success("Organización actualizada exitosamente");
        } else {
          showError(resultado.error || "Error al actualizar la organización");
        }
      } else {
        const resultado = await addOrganizacion(organizacion);
        if (resultado.success) {
          await reloadOrganizaciones();
          setShowForm(false);
          setSelectedOrganizacion(null);
          success("Organización creada exitosamente");
        } else {
          showError(resultado.error || "Error al crear la organización");
        }
      }
    } catch (error) {
      console.error("Error al guardar la organización:", error);
      showError("Error al guardar la organización");
    }
  };

  // Obtener planes únicos para el filtro
  const planesUnicos = useMemo(() => {
    const planes = organizaciones
      .map(org => org.plan?.nombrePlan)
      .filter(Boolean)
      .filter((plan, index, self) => self.indexOf(plan) === index);
    return planes.sort();
  }, [organizaciones]);

  // Filtrar organizaciones
  const organizacionesFiltradas = useMemo(() => {
    return organizaciones.filter((org) => {
      const coincideNombre = filtroNombre === "" || 
        org.nombreOrganizacion?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activa" && org.estadoOrganizacion) ||
        (filtroEstado === "inactiva" && !org.estadoOrganizacion);
      const coincidePlan = filtroPlan === "todos" || 
        org.plan?.nombrePlan === filtroPlan;
      const coincideCodigo = filtroCodigo === "" || 
        org.codigoOrganizacion?.toLowerCase().includes(filtroCodigo.toLowerCase());
      
      return coincideNombre && coincideEstado && coincidePlan && coincideCodigo;
    });
  }, [organizaciones, filtroNombre, filtroEstado, filtroPlan, filtroCodigo]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEstado("todos");
    setFiltroPlan("todos");
    setFiltroCodigo("");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroEstado !== "todos" || filtroPlan !== "todos" || filtroCodigo !== "";

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">
            Gestión de Organizaciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las organizaciones del sistema
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedOrganizacion(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nueva Organización
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedOrganizacion ? "Editar Organización" : "Nueva Organización"}
          </h2>
          <OrganizacionForm
            initialData={selectedOrganizacion}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedOrganizacion(null);
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
                  {organizacionesFiltradas.length} de {organizaciones.length} organizaciones
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏢 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre de organización..."
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
                  <option value="todos">Todas</option>
                  <option value="activa">Activas</option>
                  <option value="inactiva">Inactivas</option>
                </select>
              </div>

              {/* Filtro por Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💳 Plan
                </label>
                <select
                  value={filtroPlan}
                  onChange={(e) => setFiltroPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos los planes</option>
                  {planesUnicos.map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔑 Buscar por Código
                </label>
                <input
                  type="text"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Código de organización..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
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

          {/* TABLA DE ORGANIZACIONES */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
              <p className="mt-4 text-gray-500">Cargando organizaciones...</p>
            </div>
          ) : organizacionesFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {tieneFiltrosActivos 
                  ? "No se encontraron organizaciones con los filtros aplicados." 
                  : "No hay organizaciones registradas."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-left">Plan</th>
                    <th className="p-3 text-left">Teléfono</th>
                    <th className="p-3 text-left">Código</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {organizacionesFiltradas.map((org) => (
                    <tr key={org.idOrganizacion} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{org.idOrganizacion}</td>
                      <td className="p-3 font-medium">{org.nombreOrganizacion}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                          {org.plan?.nombrePlan || "Sin plan"}
                        </span>
                      </td>
                      <td className="p-3">{org.telefonoOrganizacion || "-"}</td>
                      <td className="p-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {org.codigoOrganizacion || "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            org.estadoOrganizacion
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {org.estadoOrganizacion ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedOrganizacion(org);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setOrganizacionParaUsuarios(org);
                            setShowAsignarUsuarios(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 hover:underline text-sm font-medium"
                        >
                          Usuarios
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar la organización "${org.nombreOrganizacion}"?`)) {
                              removeOrganizacion(org.idOrganizacion);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </>
      )}

      {/* MODAL DE ASIGNAR USUARIOS */}
      {showAsignarUsuarios && organizacionParaUsuarios && (
        <AsignarUsuariosModal
          organizacion={organizacionParaUsuarios}
          onClose={() => {
            setShowAsignarUsuarios(false);
            setOrganizacionParaUsuarios(null);
          }}
          onSuccess={() => {
            reloadOrganizaciones();
          }}
        />
      )}
    </div>
  );
}

export default function OrganizacionesPage() {
  return (
    <SuperAdminRoute>
      <OrganizacionesPageContent />
    </SuperAdminRoute>
  );
}

