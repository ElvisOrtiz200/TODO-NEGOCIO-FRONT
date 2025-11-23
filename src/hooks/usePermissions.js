import { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { getUsuarioSistema } from "../services/authService";

/**
 * Hook para obtener y verificar permisos del usuario actual
 * Retorna los permisos del usuario basados en sus roles
 */
export const usePermissions = () => {
  const [permisos, setPermisos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setPermisos([]);
          setRoles([]);
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        // Obtener usuario del sistema con roles y permisos
        const usuarioSistema = await getUsuarioSistema(user.id);
        
        if (!usuarioSistema) {
          setPermisos([]);
          setRoles([]);
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        // Verificar si es superadmin
        const esAdmin = usuarioSistema.roles?.some(ur => 
          ur.rol?.nombreRol === 'SUPERADMIN' || ur.rol?.idRol === 1
        ) || false;
        
        setIsSuperAdmin(esAdmin);

        // Si es superadmin, tiene todos los permisos
        if (esAdmin) {
          // Obtener todos los permisos disponibles
          const { data: todosPermisos } = await supabase
            .from("PERMISO")
            .select("nombrePermiso")
            .eq("estadoPermiso", true);
          
          setPermisos(todosPermisos?.map(p => p.nombrePermiso) || []);
          setRoles(['SUPERADMIN']);
          setLoading(false);
          return;
        }

        // Obtener roles del usuario
        const rolesUsuario = usuarioSistema.roles
          ?.filter(ur => ur.estadoUsuarioRol)
          .map(ur => ur.rol?.nombreRol)
          .filter(Boolean) || [];
        
        setRoles(rolesUsuario);

        // Obtener permisos de todos los roles del usuario
        if (rolesUsuario.length === 0) {
          setPermisos([]);
          setLoading(false);
          return;
        }

        // Obtener IDs de roles
        const { data: rolesData } = await supabase
          .from("ROL")
          .select("idRol")
          .in("nombreRol", rolesUsuario)
          .eq("estadoRol", true);

        if (!rolesData || rolesData.length === 0) {
          setPermisos([]);
          setLoading(false);
          return;
        }

        const idsRoles = rolesData.map(r => r.idRol);

        // Obtener permisos de esos roles
        const { data: permisosData } = await supabase
          .from("ROLPERMISO")
          .select(`
            permiso:PERMISO(nombrePermiso)
          `)
          .in("idRol", idsRoles)
          .eq("estadoRolPermiso", true)
          .eq("permiso.estadoPermiso", true);

        const nombresPermisos = permisosData
          ?.map(rp => rp.permiso?.nombrePermiso)
          .filter(Boolean) || [];

        // Eliminar duplicados
        setPermisos([...new Set(nombresPermisos)]);
      } catch (error) {
        console.error("Error cargando permisos:", error);
        setPermisos([]);
        setRoles([]);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPermissions();
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permiso - Nombre del permiso a verificar (ej: 'productos.crear')
   * @returns {boolean}
   */
  const tienePermiso = (permiso) => {
    if (isSuperAdmin) return true; // Superadmin tiene todos los permisos
    return permisos.includes(permiso);
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   * @param {string[]} permisosArray - Array de nombres de permisos
   * @returns {boolean}
   */
  const tieneAlgunPermiso = (permisosArray) => {
    if (isSuperAdmin) return true;
    return permisosArray.some(permiso => permisos.includes(permiso));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {string[]} permisosArray - Array de nombres de permisos
   * @returns {boolean}
   */
  const tieneTodosLosPermisos = (permisosArray) => {
    if (isSuperAdmin) return true;
    return permisosArray.every(permiso => permisos.includes(permiso));
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} rol - Nombre del rol a verificar
   * @returns {boolean}
   */
  const tieneRol = (rol) => {
    if (isSuperAdmin) return true;
    return roles.includes(rol);
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {string[]} rolesArray - Array de nombres de roles
   * @returns {boolean}
   */
  const tieneAlgunRol = (rolesArray) => {
    if (isSuperAdmin) return true;
    return rolesArray.some(rol => roles.includes(rol));
  };

  return {
    permisos,
    roles,
    isSuperAdmin,
    loading,
    tienePermiso,
    tieneAlgunPermiso,
    tieneTodosLosPermisos,
    tieneRol,
    tieneAlgunRol,
  };
};

