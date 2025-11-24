import { useOrganizacion } from "../context/OrganizacionContext";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../api/supabaseClient";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProductos } from "../modules/productos/services/productoService";
import { getUsuarios } from "../modules/usuarios/services/usuarioService";
import { getProveedores } from "../modules/proveedores/services/proveedorService";
import { getClientes } from "../modules/clientes/services/clienteService";
import { getAlmacenes } from "../modules/almacenes/services/almacenService";

export default function HomePage() {
  const { organizacion, usuario, loading, organizacionVista } = useOrganizacion();
  const { isSuperAdmin } = usePermissions();
  const [userEmail, setUserEmail] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  
  // Estadísticas de la organización
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    totalUsuarios: 0,
    totalProveedores: 0,
    totalClientes: 0,
    totalAlmacenes: 0,
    loading: true
  });

  useEffect(() => {
    // Obtener email del usuario autenticado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });

    // Actualizar hora cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Determinar saludo según la hora
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Buenos días");
    } else if (hour < 18) {
      setGreeting("Buenas tardes");
    } else {
      setGreeting("Buenas noches");
    }

    return () => clearInterval(timer);
  }, []);

  // Cargar estadísticas cuando el superadmin está viendo una organización
  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!organizacionVista) {
        setEstadisticas({
          totalProductos: 0,
          totalUsuarios: 0,
          totalProveedores: 0,
          totalClientes: 0,
          totalAlmacenes: 0,
          loading: false
        });
        return;
      }

      setEstadisticas(prev => ({ ...prev, loading: true }));

      try {
        const orgId = organizacionVista.idOrganizacion;
        
        // Cargar todas las estadísticas en paralelo
        const [productos, usuarios, proveedores, clientes, almacenes] = await Promise.all([
          getProductos(orgId).catch(() => []),
          getUsuarios(orgId).catch(() => []),
          getProveedores(orgId).catch(() => []),
          getClientes().catch(() => []), // Los clientes no tienen filtro por organización por ahora
          getAlmacenes(orgId).catch(() => [])
        ]);

        setEstadisticas({
          totalProductos: productos?.length || 0,
          totalUsuarios: usuarios?.length || 0,
          totalProveedores: proveedores?.length || 0,
          totalClientes: clientes?.length || 0,
          totalAlmacenes: almacenes?.length || 0,
          loading: false
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        setEstadisticas(prev => ({ ...prev, loading: false }));
      }
    };

    cargarEstadisticas();
  }, [organizacionVista]);

  // Formatear fecha y hora
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER DE BIENVENIDA */}
      <div className="bg-gradient-to-br from-[#2B3E3C] via-[#3a5a56] to-[#2B3E3C] rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 lg:p-12 text-white relative overflow-hidden">
        {/* Decoración de fondo animada */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mb-36 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-3 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Logo o inicial de la organización */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-white bg-opacity-20 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-5xl font-bold backdrop-blur-md border-2 md:border-4 border-white border-opacity-30 shadow-2xl transition-transform hover:scale-105">
              {(organizacionVista || organizacion) ? (
                (organizacionVista || organizacion).logoOrganizacion ? (
                  <img 
                    src={(organizacionVista || organizacion).logoOrganizacion} 
                    alt={(organizacionVista || organizacion).nombreOrganizacion}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${(organizacionVista || organizacion)?.logoOrganizacion ? 'hidden' : ''}`}>
                {(organizacionVista || organizacion) ? (
                  <span className="text-4xl md:text-5xl">
                    {getInitials((organizacionVista || organizacion).nombreOrganizacion)}
                  </span>
                ) : isSuperAdmin ? (
                  <span className="text-4xl md:text-5xl">👑</span>
                ) : (
                  <span className="text-4xl md:text-5xl">👤</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-1 md:mb-2 font-medium">
                {greeting}, {usuario?.nombreUsuario?.split(' ')[0] || userEmail?.split('@')[0] || "Usuario"}
              </p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-3">
                {organizacionVista ? (
                  <>
                    Viendo: <br className="hidden sm:block" />
                    <span className="text-yellow-300 drop-shadow-lg">{organizacionVista.nombreOrganizacion}</span>
                  </>
                ) : organizacion ? (
                  <>
                    Bienvenido a <br className="hidden sm:block" />
                    <span className="text-yellow-300 drop-shadow-lg">{organizacion.nombreOrganizacion}</span>
                  </>
                ) : isSuperAdmin ? (
                  <>
                    Panel de <br className="hidden sm:block" />
                    <span className="text-yellow-300">Super Administrador</span>
                  </>
                ) : (
                  "Bienvenido al Sistema"
                )}
              </h1>
              {(organizacionVista || organizacion)?.descripcionOrganizacion && (
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 max-w-2xl">
                  {(organizacionVista || organizacion).descripcionOrganizacion}
                </p>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 md:mt-8">
            <div className="bg-white bg-opacity-15 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-md border border-white border-opacity-30 shadow-lg hover:bg-opacity-20 transition-all">
              <p className="text-[10px] sm:text-xs text-gray-700 mb-1 uppercase tracking-wide">Fecha</p>
              <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-700 font-bold line-clamp-2">{formatDate(currentTime)}</p>
            </div>
            <div className="bg-white bg-opacity-15 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-md border border-white border-opacity-30 shadow-lg hover:bg-opacity-20 transition-all">
              <p className="text-[10px] sm:text-xs text-gray-700 mb-1 uppercase tracking-wide">Hora</p>
              <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-700 font-bold">{formatTime(currentTime)}</p>
            </div>
            <div className="bg-white bg-opacity-15 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-md border border-white border-opacity-30 shadow-lg hover:bg-opacity-20 transition-all">
              <p className="text-[10px] sm:text-xs text-gray-700 mb-1 uppercase tracking-wide">Estado</p>
              <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-700 font-bold">
                {(organizacionVista || organizacion) ? (
                  <span className="flex items-center gap-1 md:gap-2">
                    <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400"></span>
                    <span className="hidden sm:inline">Activo</span>
                    <span className="sm:hidden">OK</span>
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm md:text-lg lg:text-xl">Sin organización</span>
                )}
              </p>
            </div>
            {(organizacionVista || organizacion)?.plan && (
              <div className="bg-white bg-opacity-15 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-md border border-white border-opacity-30 shadow-lg hover:bg-opacity-20 transition-all">
                <p className="text-[10px] sm:text-xs text-gray-300 mb-1 uppercase tracking-wide">Plan</p>
                <p className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold truncate">{(organizacionVista || organizacion).plan.nombrePlan}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MINISISTEMA PARA SUPERADMIN VIENDO ORGANIZACIÓN */}
      {organizacionVista && (
        <div className="space-y-4 md:space-y-6">
          {/* Banner de organización activa */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white bg-opacity-20 rounded-lg md:rounded-xl flex items-center justify-center text-2xl md:text-3xl backdrop-blur-md">
                  🏢
                </div>
                <div>
                  <p className="text-xs md:text-sm text-blue-100 mb-1">Viendo organización</p>
                  <h2 className="text-lg md:text-2xl font-bold">{organizacionVista.nombreOrganizacion}</h2>
                  {organizacionVista.codigoOrganizacion && (
                    <p className="text-xs md:text-sm text-blue-100 mt-1">Código: {organizacionVista.codigoOrganizacion}</p>
                  )}
                </div>
              </div>
              <Link
                to="/home/organizaciones"
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm md:text-base font-medium transition-colors backdrop-blur-md"
              >
                Cambiar organización
              </Link>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl">📦</div>
                {estadisticas.loading && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">Productos</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{estadisticas.totalProductos}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl">👥</div>
                {estadisticas.loading && (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">Usuarios</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{estadisticas.totalUsuarios}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl">🏢</div>
                {estadisticas.loading && (
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">Proveedores</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{estadisticas.totalProveedores}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl">👤</div>
                {estadisticas.loading && (
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">Clientes</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{estadisticas.totalClientes}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl">🏪</div>
                {estadisticas.loading && (
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">Almacenes</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{estadisticas.totalAlmacenes}</p>
            </div>
          </div>

          {/* Accesos rápidos al minisistema */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-[#2B3E3C] mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Accesos Rápidos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              <Link
                to="/home/productos"
                className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-blue-200 hover:border-blue-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                <p className="font-semibold text-gray-800 text-sm">Productos</p>
              </Link>
              <Link
                to="/home/ventas"
                className="group bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-green-200 hover:border-green-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                <p className="font-semibold text-gray-800 text-sm">Ventas</p>
              </Link>
              <Link
                to="/home/compras"
                className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-purple-200 hover:border-purple-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🛒</div>
                <p className="font-semibold text-gray-800 text-sm">Compras</p>
              </Link>
              <Link
                to="/home/inventario"
                className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-orange-200 hover:border-orange-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <p className="font-semibold text-gray-800 text-sm">Inventario</p>
              </Link>
              <Link
                to="/home/clientes"
                className="group bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-pink-200 hover:border-pink-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">👤</div>
                <p className="font-semibold text-gray-800 text-sm">Clientes</p>
              </Link>
              <Link
                to="/home/proveedores"
                className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-indigo-200 hover:border-indigo-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
                <p className="font-semibold text-gray-800 text-sm">Proveedores</p>
              </Link>
              <Link
                to="/home/almacenes"
                className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-yellow-200 hover:border-yellow-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🏪</div>
                <p className="font-semibold text-gray-800 text-sm">Almacenes</p>
              </Link>
              <Link
                to="/home/usuarios"
                className="group bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-teal-200 hover:border-teal-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <p className="font-semibold text-gray-800 text-sm">Usuarios</p>
              </Link>
              <Link
                to="/home/categorias"
                className="group bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-cyan-200 hover:border-cyan-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🏷️</div>
                <p className="font-semibold text-gray-800 text-sm">Categorías</p>
              </Link>
              <Link
                to="/home/movimientos-inventario"
                className="group bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-105 border-2 border-red-200 hover:border-red-400 text-center"
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">🔄</div>
                <p className="font-semibold text-gray-800 text-sm">Movimientos</p>
              </Link>
            </div>
          </div>

          {/* Información detallada de la organización */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-[#2B3E3C]">
              <h3 className="text-lg font-bold text-[#2B3E3C] mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Información de la Organización
              </h3>
              <div className="space-y-3">
                {organizacionVista.telefonoOrganizacion && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-400">📞</span>
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-semibold text-gray-800">{organizacionVista.telefonoOrganizacion}</p>
                    </div>
                  </div>
                )}
                {organizacionVista.direccionOrganizacion && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-400">📍</span>
                    <div>
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="font-semibold text-gray-800">{organizacionVista.direccionOrganizacion}</p>
                    </div>
                  </div>
                )}
                {organizacionVista.plan && (
                  <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <span className="text-purple-500">💳</span>
                    <div>
                      <p className="text-xs text-purple-600 font-semibold">Plan</p>
                      <p className="font-bold text-gray-800">{organizacionVista.plan.nombrePlan}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-400">📅</span>
                  <div>
                    <p className="text-xs text-gray-500">Estado</p>
                    <p className="font-semibold text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        organizacionVista.estadoOrganizacion 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {organizacionVista.estadoOrganizacion ? 'Activa' : 'Inactiva'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-[#2B3E3C] mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Resumen de Datos
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total de registros</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {estadisticas.totalProductos + estadisticas.totalUsuarios + estadisticas.totalProveedores + estadisticas.totalClientes}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Productos activos</p>
                    <p className="text-lg font-bold text-gray-800">{estadisticas.totalProductos}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Usuarios activos</p>
                    <p className="text-lg font-bold text-gray-800">{estadisticas.totalUsuarios}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFORMACIÓN DE LA ORGANIZACIÓN */}
      {organizacion && !organizacionVista && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Detalles de la organización */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-l-4 border-[#2B3E3C] hover:shadow-2xl transition-shadow">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2B3E3C] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#2B3E3C] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-base md:text-xl">🏢</span>
              </div>
              <span className="break-words">Información de la Organización</span>
            </h2>
            <div className="space-y-3 md:space-y-4">
              {organizacion.codigoOrganizacion && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0">🔖</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Código</p>
                    <p className="font-semibold text-gray-800 text-sm md:text-base break-words">{organizacion.codigoOrganizacion}</p>
                  </div>
                </div>
              )}
              {organizacion.telefonoOrganizacion && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0">📞</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Teléfono</p>
                    <p className="font-semibold text-gray-800 text-sm md:text-base break-words">{organizacion.telefonoOrganizacion}</p>
                  </div>
                </div>
              )}
              {organizacion.direccionOrganizacion && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dirección</p>
                    <p className="font-semibold text-gray-800 text-sm md:text-base break-words">{organizacion.direccionOrganizacion}</p>
                  </div>
                </div>
              )}
              {organizacion.plan && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <span className="text-purple-500 mt-1 text-sm md:text-base flex-shrink-0">💳</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-600 uppercase tracking-wide mb-1 font-semibold">Plan Actual</p>
                    <p className="font-bold text-gray-800 text-sm md:text-base lg:text-lg break-words">
                      {organizacion.plan.nombrePlan}
                    </p>
                    {organizacion.plan.precioPlan && (
                      <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                        ${organizacion.plan.precioPlan} {organizacion.plan.descripcionPlan && `- ${organizacion.plan.descripcionPlan}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del usuario */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-l-4 border-blue-500 hover:shadow-2xl transition-shadow">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2B3E3C] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-base md:text-xl">👤</span>
              </div>
              <span className="break-words">Tu Información</span>
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0">👨‍💼</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
                  <p className="font-semibold text-gray-800 text-sm md:text-base break-words">{usuario?.nombreUsuario || "No especificado"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0">📧</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-semibold text-gray-800 text-xs md:text-sm break-all">{userEmail || usuario?.emailUsuario || "No especificado"}</p>
                </div>
              </div>
              {usuario?.telefonoUsuario && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-400 mt-1 text-sm md:text-base flex-shrink-0">📱</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Teléfono</p>
                    <p className="font-semibold text-gray-800 text-sm md:text-base break-words">{usuario.telefonoUsuario}</p>
                  </div>
                </div>
              )}
              {usuario?.roles && usuario.roles.length > 0 && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-400 mt-1 text-sm md:text-base">🎭</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Roles</p>
                    <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                      {usuario.roles.map((ur, idx) => (
                        <span key={idx} className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-semibold">
                          {ur.rol?.nombreRol || "Sin nombre"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {isSuperAdmin && (
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-500 mt-1 text-sm md:text-base flex-shrink-0">👑</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-600 uppercase tracking-wide mb-1 font-semibold">Rol Especial</p>
                    <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs md:text-sm font-bold shadow-lg">
                      Super Administrador
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA PARA SUPERADMIN SIN ORGANIZACIÓN */}
      {isSuperAdmin && !organizacion && (
        <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 text-center border-2 border-purple-100">
          <div className="max-w-2xl mx-auto">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 md:mb-6 animate-bounce">👑</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#2B3E3C] mb-2 md:mb-3">Panel de Super Administrador</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 md:mb-8 px-2">
              Gestiona organizaciones, usuarios, roles y permisos del sistema
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <Link
                to="/home/organizaciones"
                className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-100 hover:border-purple-300"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-3">🏢</div>
                <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base">Organizaciones</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Gestionar clientes</p>
              </Link>
              <Link
                to="/home/usuarios"
                className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-100 hover:border-blue-300"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-3">👥</div>
                <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base">Usuarios</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Administrar usuarios</p>
              </Link>
              <Link
                to="/home/roles"
                className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-100 hover:border-green-300"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-3">🎭</div>
                <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base">Roles</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Configurar roles</p>
              </Link>
              <Link
                to="/home/permisos"
                className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-100 hover:border-orange-300"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-3">🔐</div>
                <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base">Permisos</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Gestionar permisos</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ACCESOS RÁPIDOS */}
      {organizacion && (
        <div className="bg-white rounded-xl md:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#2B3E3C] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-base md:text-xl">⚡</span>
            </div>
            <span className="break-words">Accesos Rápidos</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            <Link
              to="/home/productos"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-6 hover:shadow-2xl transition-all hover:scale-105 border-2 border-blue-200 hover:border-blue-400"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">📦</div>
              <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base lg:text-lg">Productos</p>
              <p className="text-[10px] sm:text-xs text-gray-600">Gestionar inventario</p>
            </Link>
            <Link
              to="/home/ventas"
              className="group bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-6 hover:shadow-2xl transition-all hover:scale-105 border-2 border-green-200 hover:border-green-400"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">💰</div>
              <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base lg:text-lg">Ventas</p>
              <p className="text-[10px] sm:text-xs text-gray-600">Registrar ventas</p>
            </Link>
            <Link
              to="/home/compras"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-6 hover:shadow-2xl transition-all hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">🛒</div>
              <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base lg:text-lg">Compras</p>
              <p className="text-[10px] sm:text-xs text-gray-600">Registrar compras</p>
            </Link>
            <Link
              to="/home/inventario"
              className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg md:rounded-2xl p-3 sm:p-4 md:p-6 hover:shadow-2xl transition-all hover:scale-105 border-2 border-orange-200 hover:border-orange-400"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">📊</div>
              <p className="font-bold text-gray-800 mb-1 text-xs sm:text-sm md:text-base lg:text-lg">Inventario</p>
              <p className="text-[10px] sm:text-xs text-gray-600">Ver stock</p>
            </Link>
          </div>
        </div>
      )}

      {/* ESTADÍSTICAS RÁPIDAS (solo para usuarios con organización, no para superadmin viendo organización) */}
      {organizacion && !organizacionVista && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs sm:text-sm mb-1">Total de Productos</p>
                <p className="text-2xl sm:text-3xl font-bold">-</p>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl opacity-20 flex-shrink-0 ml-2">📦</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-green-100 text-xs sm:text-sm mb-1">Ventas del Mes</p>
                <p className="text-2xl sm:text-3xl font-bold">-</p>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl opacity-20 flex-shrink-0 ml-2">💰</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 text-white sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-purple-100 text-xs sm:text-sm mb-1">Compras del Mes</p>
                <p className="text-2xl sm:text-3xl font-bold">-</p>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl opacity-20 flex-shrink-0 ml-2">🛒</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
