import { usePermissions } from "../hooks/usePermissions";

/**
 * Componente wrapper que muestra contenido solo si el usuario tiene el permiso requerido
 * 
 * @param {string|string[]} permiso - Permiso o array de permisos requeridos
 * @param {boolean} requerirTodos - Si es true, requiere todos los permisos. Si es false, solo requiere uno.
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permisos
 * @param {React.ReactNode} fallback - Contenido a mostrar si NO tiene permisos (opcional)
 */
export default function PermisoGuard({ 
  permiso, 
  requerirTodos = false,
  children, 
  fallback = null 
}) {
  const { tienePermiso, tieneAlgunPermiso, tieneTodosLosPermisos, loading } = usePermissions();

  if (loading) {
    return null; // O puedes mostrar un spinner
  }

  // Si permiso es un array
  if (Array.isArray(permiso)) {
    const tieneAcceso = requerirTodos 
      ? tieneTodosLosPermisos(permiso)
      : tieneAlgunPermiso(permiso);
    
    return tieneAcceso ? <>{children}</> : <>{fallback}</>;
  }

  // Si permiso es un string
  const tieneAcceso = tienePermiso(permiso);
  return tieneAcceso ? <>{children}</> : <>{fallback}</>;
}

/**
 * Componente wrapper que muestra contenido solo si el usuario tiene el rol requerido
 * 
 * @param {string|string[]} rol - Rol o array de roles requeridos
 * @param {boolean} requerirTodos - Si es true, requiere todos los roles. Si es false, solo requiere uno.
 * @param {React.ReactNode} children - Contenido a mostrar si tiene el rol
 * @param {React.ReactNode} fallback - Contenido a mostrar si NO tiene el rol (opcional)
 */
export function RolGuard({ 
  rol, 
  requerirTodos = false,
  children, 
  fallback = null 
}) {
  const { tieneRol, tieneAlgunRol, roles, isSuperAdmin, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Superadmin tiene acceso a todo
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Si rol es un array
  if (Array.isArray(rol)) {
    const tieneAcceso = requerirTodos 
      ? rol.every(r => tieneRol(r))
      : tieneAlgunRol(rol);
    
    return tieneAcceso ? <>{children}</> : <>{fallback}</>;
  }

  // Si rol es un string
  const tieneAcceso = tieneRol(rol);
  return tieneAcceso ? <>{children}</> : <>{fallback}</>;
}

