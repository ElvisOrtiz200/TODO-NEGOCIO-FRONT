import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../api/supabaseClient";
import { validarMembresiaOrganizacion, getUsuarioSistema } from "../services/authService";

const OrganizacionContext = createContext(null);

// Cache para organización
const orgCache = {
  userId: null,
  organizacion: null,
  usuario: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

export const useOrganizacion = () => {
  const context = useContext(OrganizacionContext);
  if (!context) {
    throw new Error("useOrganizacion debe ser usado dentro de OrganizacionProvider");
  }
  return context;
};

export const OrganizacionProvider = ({ children }) => {
  const [organizacion, setOrganizacion] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para cuando el superadmin está viendo una organización específica
  const [organizacionVista, setOrganizacionVista] = useState(null);
  const hasInitialized = useRef(false);
  const authListenerRef = useRef(null);

  const cargarOrganizacion = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setOrganizacion(null);
        setUsuario(null);
        orgCache.userId = null;
        orgCache.organizacion = null;
        orgCache.usuario = null;
        setLoading(false);
        return;
      }

      // Verificar caché
      const isCached = !forceRefresh && 
                      orgCache.userId === user.id && 
                      orgCache.timestamp && 
                      (Date.now() - orgCache.timestamp) < orgCache.CACHE_DURATION;

      if (isCached) {
        setOrganizacion(orgCache.organizacion);
        setUsuario(orgCache.usuario);
        setError(null);
        setLoading(false);
        return;
      }

      // Intentar validar membresía, pero no fallar si el usuario no existe todavía
      const validacion = await validarMembresiaOrganizacion(user.id);
      
      if (validacion.valido) {
        setOrganizacion(validacion.organizacion);
        setUsuario(validacion.usuario);
        setError(null);
        // Actualizar caché
        orgCache.userId = user.id;
        orgCache.organizacion = validacion.organizacion;
        orgCache.usuario = validacion.usuario;
        orgCache.timestamp = Date.now();
      } else {
        // Si el usuario no existe en el sistema, es un usuario nuevo
        setOrganizacion(null);
        setUsuario(validacion.usuario);
        setError(null);
        // Actualizar caché
        orgCache.userId = user.id;
        orgCache.organizacion = null;
        orgCache.usuario = validacion.usuario;
        orgCache.timestamp = Date.now();
      }
    } catch (err) {
      console.error("Error cargando organización:", err);
      setError(null);
      setOrganizacion(null);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const actualizarOrganizacion = async () => {
    await cargarOrganizacion();
  };

  // Función para que el superadmin entre a ver una organización específica
  const entrarAOrganizacion = (organizacion) => {
    setOrganizacionVista(organizacion);
    // Guardar en localStorage para persistir al recargar
    if (organizacion) {
      localStorage.setItem('organizacionVista', JSON.stringify(organizacion));
    }
  };

  // Función para salir de la vista de organización
  const salirDeOrganizacion = () => {
    setOrganizacionVista(null);
    localStorage.removeItem('organizacionVista');
  };

  // Cargar organización vista desde localStorage al iniciar
  useEffect(() => {
    const orgVistaGuardada = localStorage.getItem('organizacionVista');
    if (orgVistaGuardada) {
      try {
        const org = JSON.parse(orgVistaGuardada);
        setOrganizacionVista(org);
      } catch (e) {
        console.error('Error cargando organización vista:', e);
        localStorage.removeItem('organizacionVista');
      }
    }
  }, []);

  // Determinar qué organización mostrar: si hay organizacionVista, usar esa; sino, la del usuario
  const organizacionActiva = organizacionVista || organizacion;

  useEffect(() => {
    // Evitar inicialización múltiple
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    cargarOrganizacion();

    // Escuchar cambios en la autenticación (solo cambios reales)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Ignorar eventos de inicialización si ya tenemos datos en caché
        if (event === 'INITIAL_SESSION' && orgCache.userId) {
          return;
        }
        
        // Solo recargar en cambios reales
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (session) {
            // Si cambió el usuario, limpiar caché
            if (orgCache.userId && orgCache.userId !== session.user.id) {
              orgCache.userId = null;
              orgCache.organizacion = null;
              orgCache.usuario = null;
              orgCache.timestamp = null;
            }
            await cargarOrganizacion(true); // Forzar refresh en cambios reales
          } else {
            setOrganizacion(null);
            setUsuario(null);
            setOrganizacionVista(null); // Limpiar organización vista al cerrar sesión
            orgCache.userId = null;
            orgCache.organizacion = null;
            orgCache.usuario = null;
            orgCache.timestamp = null;
            localStorage.removeItem('organizacionVista'); // Limpiar del localStorage
            setLoading(false);
          }
        }
      }
    );

    authListenerRef.current = subscription;

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, []);

  return (
    <OrganizacionContext.Provider
      value={{
        organizacion: organizacionActiva, // Usar organizacionActiva en lugar de organizacion
        organizacionOriginal: organizacion, // Mantener la original para referencia
        organizacionVista, // La organización que el superadmin está viendo
        usuario,
        loading,
        error,
        actualizarOrganizacion,
        cargarOrganizacion,
        entrarAOrganizacion,
        salirDeOrganizacion,
      }}
    >
      {children}
    </OrganizacionContext.Provider>
  );
};

