import { useOrganizacion } from "../context/OrganizacionContext";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../api/supabaseClient";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { organizacion, usuario, loading } = useOrganizacion();
  const { isSuperAdmin } = usePermissions();
  const [userEmail, setUserEmail] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

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
              {organizacion ? (
                organizacion.logoOrganizacion ? (
                  <img 
                    src={organizacion.logoOrganizacion} 
                    alt={organizacion.nombreOrganizacion}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${organizacion?.logoOrganizacion ? 'hidden' : ''}`}>
                {organizacion ? (
                  <span className="text-4xl md:text-5xl">
                    {getInitials(organizacion.nombreOrganizacion)}
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
                {organizacion ? (
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
              {organizacion?.descripcionOrganizacion && (
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 max-w-2xl">
                  {organizacion.descripcionOrganizacion}
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
                {organizacion ? (
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
            {organizacion?.plan && (
              <div className="bg-white bg-opacity-15 rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-md border border-white border-opacity-30 shadow-lg hover:bg-opacity-20 transition-all">
                <p className="text-[10px] sm:text-xs text-gray-300 mb-1 uppercase tracking-wide">Plan</p>
                <p className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold truncate">{organizacion.plan.nombrePlan}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DE LA ORGANIZACIÓN */}
      {organizacion && (
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

      {/* ESTADÍSTICAS RÁPIDAS (solo para usuarios con organización) */}
      {organizacion && (
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
