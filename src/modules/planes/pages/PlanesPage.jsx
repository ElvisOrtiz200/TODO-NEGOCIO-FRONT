import { useState, useMemo } from "react";
import { usePlanes } from "../hooks/usePlanes";
import PlanForm from "../components/PlanForm";
import SuperAdminRoute from "../../../components/SuperAdminRoute";

function PlanesPageContent() {
  const { planes, loading, error, addPlan, editPlan, removePlan } = usePlanes();
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroDescripcion, setFiltroDescripcion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");

  const handleSubmit = async (plan) => {
    try {
      if (selectedPlan) {
        const resultado = await editPlan(selectedPlan.idPlan, plan);
        if (resultado.success) {
          setShowForm(false);
          setSelectedPlan(null);
        } else {
          alert(`Error: ${resultado.error}`);
        }
      } else {
        const resultado = await addPlan(plan);
        if (resultado.success) {
          setShowForm(false);
          setSelectedPlan(null);
        } else {
          alert(`Error: ${resultado.error}`);
        }
      }
    } catch (error) {
      console.error("Error al guardar el plan:", error);
      alert("Error al guardar el plan. Por favor, verifica los datos.");
    }
  };

  // Filtrar planes
  const planesFiltrados = useMemo(() => {
    return planes.filter((plan) => {
      const coincideNombre = filtroNombre === "" || 
        plan.nombrePlan?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideDescripcion = filtroDescripcion === "" || 
        plan.descripcionPlan?.toLowerCase().includes(filtroDescripcion.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && plan.estadoPlan) ||
        (filtroEstado === "inactivo" && !plan.estadoPlan);
      
      // Filtro por precio
      const precio = parseFloat(plan.precioPlan) || 0;
      const precioMin = filtroPrecioMin === "" ? -Infinity : parseFloat(filtroPrecioMin);
      const precioMax = filtroPrecioMax === "" ? Infinity : parseFloat(filtroPrecioMax);
      const coincidePrecio = precio >= precioMin && precio <= precioMax;
      
      return coincideNombre && coincideDescripcion && coincideEstado && coincidePrecio;
    });
  }, [planes, filtroNombre, filtroDescripcion, filtroEstado, filtroPrecioMin, filtroPrecioMax]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroDescripcion("");
    setFiltroEstado("todos");
    setFiltroPrecioMin("");
    setFiltroPrecioMax("");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroDescripcion !== "" || filtroEstado !== "todos" || 
    filtroPrecioMin !== "" || filtroPrecioMax !== "";

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">
            Gestión de Planes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los planes de suscripción disponibles
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedPlan(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Plan
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
            {selectedPlan ? "Editar Plan" : "Nuevo Plan"}
          </h2>
          <PlanForm
            initialData={selectedPlan}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedPlan(null);
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
                  {planesFiltrados.length} de {planes.length} planes
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Ej: Básico, Premium..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Buscar en Descripción
                </label>
                <input
                  type="text"
                  value={filtroDescripcion}
                  onChange={(e) => setFiltroDescripcion(e.target.value)}
                  placeholder="Buscar en descripción..."
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

            {/* Filtro por Rango de Precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💰 Precio Mínimo
                </label>
                <input
                  type="number"
                  value={filtroPrecioMin}
                  onChange={(e) => setFiltroPrecioMin(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  💰 Precio Máximo
                </label>
                <input
                  type="number"
                  value={filtroPrecioMax}
                  onChange={(e) => setFiltroPrecioMax(e.target.value)}
                  placeholder="9999.99"
                  min="0"
                  step="0.01"
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

          {/* TABLA DE PLANES */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
              <p className="mt-4 text-gray-500">Cargando planes...</p>
            </div>
          ) : planesFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {tieneFiltrosActivos 
                  ? "No se encontraron planes con los filtros aplicados." 
                  : "No hay planes registrados."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-left">Precio</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {planesFiltrados.map((plan) => (
                    <tr key={plan.idPlan} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{plan.idPlan}</td>
                      <td className="p-3 font-medium">{plan.nombrePlan}</td>
                      <td className="p-3 text-gray-600">
                        {plan.descripcionPlan || "-"}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-green-600">
                          ${parseFloat(plan.precioPlan).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            plan.estadoPlan
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {plan.estadoPlan ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el plan "${plan.nombrePlan}"?`)) {
                              removePlan(plan.idPlan);
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
    </div>
  );
}

export default function PlanesPage() {
  return (
    <SuperAdminRoute>
      <PlanesPageContent />
    </SuperAdminRoute>
  );
}

