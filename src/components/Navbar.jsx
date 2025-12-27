import { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useOrganizacion } from "../context/OrganizacionContext";
import { usePermissions } from "../hooks/usePermissions";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { organizacionVista, salirDeOrganizacion } = useOrganizacion();
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    // Obtener usuario actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleSalirOrganizacion = () => {
    salirDeOrganizacion();
    navigate("/home/organizaciones");
  };

  return (
    <header className="flex items-center justify-between bg-white shadow-md px-3 md:px-6 py-3 border-b border-gray-200">
      <div className="flex items-center gap-3 md:gap-0">
        {/* Botón menú hamburguesa para móvil */}
        <button
          id="menu-button"
          onClick={onMenuClick}
          className="md:hidden text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base md:text-lg font-semibold text-gray-800">Panel de Control</h1>
          {user && (
            <p className="text-xs text-gray-500 mt-0.5 hidden md:block">
              {user.email}
            </p>
          )}
          {/* Indicador de organización activa para superadmin */}
          {isSuperAdmin && organizacionVista && (
            <div className="mt-1 flex items-center gap-2">
              <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="hidden sm:inline">Viendo: {organizacionVista.nombreOrganizacion}</span>
                <span className="sm:hidden">Viendo: {organizacionVista.nombreOrganizacion.substring(0, 15)}...</span>
              </div>
              <button
                onClick={handleSalirOrganizacion}
                className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                title="Salir de esta organización"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {user && (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2B3E3C] flex items-center justify-center text-white text-xs md:text-sm font-semibold">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-xs md:text-sm text-gray-600 md:hidden truncate max-w-[100px]">
              {user.email?.split('@')[0]}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 md:gap-2 bg-red-500 hover:bg-red-600 text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-colors duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
