import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

/**
 * Componente de ruta protegida por permisos
 * Redirige a /home si el usuario no tiene el permiso requerido
 * 
 * @param {string|string[]} permiso - Permiso o array de permisos requeridos
 * @param {boolean} requerirTodos - Si es true, requiere todos los permisos. Si es false, solo requiere uno.
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permisos
 */
export default function PermisoRoute({ 
  permiso, 
  requerirTodos = false,
  children 
}) {
  const { tienePermiso, tieneAlgunPermiso, tieneTodosLosPermisos, loading, isSuperAdmin } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Superadmin tiene acceso a todo
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Si permiso es un array
  if (Array.isArray(permiso)) {
    const tieneAcceso = requerirTodos 
      ? tieneTodosLosPermisos(permiso)
      : tieneAlgunPermiso(permiso);
    
    if (!tieneAcceso) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  }

  // Si permiso es un string
  const tieneAcceso = tienePermiso(permiso);
  
  if (!tieneAcceso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

