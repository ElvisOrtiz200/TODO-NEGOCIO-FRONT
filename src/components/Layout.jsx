import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";
import { supabase } from "../api/supabaseClient";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Procesar el hash de OAuth si viene en la URL
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        console.log("🔍 Hash de OAuth detectado en Layout:", hash.substring(0, 50) + "...");
        
        // Esperar a que Supabase procese el hash
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar la sesión
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          console.log("✅ Sesión establecida desde hash en Layout");
          // Limpiar el hash de la URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (error) {
          console.error("❌ Error procesando hash:", error);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col w-full md:w-auto">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-3 md:p-6 flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
