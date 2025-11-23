import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import SetPasswordModal from "./SetPasswordModal";
import OnboardingModal from "./OnboardingModal";
import { validarMembresiaOrganizacion, getUsuarioSistema, esSuperAdmin } from "../services/authService";
import { useOrganizacion } from "../context/OrganizacionContext";

// Cache para evitar verificaciones redundantes
const sessionCache = {
  userId: null,
  isSuperAdmin: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

export default function ProtectedRoute({ children }) {
  const { organizacion, usuario, loading: orgLoading } = useOrganizacion();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingSuperAdmin, setCheckingSuperAdmin] = useState(false);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const hasInitialized = useRef(false);
  const authListenerRef = useRef(null);

  useEffect(() => {
    // Evitar inicialización múltiple
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Limpiar flags de creación de usuario si existen (por si quedaron de una sesión anterior)
    const isCreatingUser = localStorage.getItem('creating_user') === 'true';
    const originalUserId = localStorage.getItem('original_user_id');
    
    if (isCreatingUser && originalUserId) {
      const creationTime = localStorage.getItem('creating_user_time');
      if (creationTime) {
        const timeElapsed = Date.now() - parseInt(creationTime);
        if (timeElapsed > 30000) {
          localStorage.removeItem('creating_user');
          localStorage.removeItem('original_user_id');
          localStorage.removeItem('original_session_tokens');
          localStorage.removeItem('creating_user_time');
        }
      }
    }

    const checkAuth = async () => {
      try {
        // Verificar si hay sesión en caché válida
        const cachedSession = sessionStorage.getItem('auth_session');
        if (cachedSession) {
          try {
            const parsed = JSON.parse(cachedSession);
            if (parsed.expiresAt > Date.now()) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session && session.user.id === parsed.userId) {
                setAuthenticated(true);
                setUser(session.user);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            // Si el caché es inválido, continuar con verificación normal
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          setAuthenticated(true);
          setUser(session.user);
          
          // Guardar en caché
          sessionStorage.setItem('auth_session', JSON.stringify({
            userId: session.user.id,
            expiresAt: Date.now() + (60 * 60 * 1000) // 1 hora
          }));

          // Verificar si el usuario viene de OAuth (Google) y no tiene contraseña establecida
          const hasGoogleIdentity = session.user.identities?.some(id => id.provider === 'google');
          const hasEmailIdentity = session.user.identities?.some(id => id.provider === 'email');
          const hasSkippedPassword = localStorage.getItem(`password_skipped_${session.user.id}`);
          
          if (hasGoogleIdentity && !hasEmailIdentity && !hasSkippedPassword) {
            setTimeout(() => {
              setShowPasswordModal(true);
            }, 500);
          }
        } else {
          setAuthenticated(false);
          sessionStorage.removeItem('auth_session');
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthenticated(false);
        sessionStorage.removeItem('auth_session');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en la autenticación (solo cambios reales, no recargas)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar eventos de inicialización si ya tenemos sesión
      if (event === 'INITIAL_SESSION' && authenticated) {
        return;
      }
      // Si estamos creando un usuario, ignorar cambios temporales de sesión
      const isCreatingUser = localStorage.getItem('creating_user') === 'true';
      const originalUserId = localStorage.getItem('original_user_id');
      
      if (isCreatingUser && session && originalUserId) {
        // Si la sesión no corresponde al usuario original, ignorar el cambio
        // y forzar la restauración de la sesión original
        if (session.user.id !== originalUserId) {
          console.log("⏸️ Ignorando cambio de sesión temporal durante creación de usuario");
          console.log(`   Sesión actual: ${session.user.id}, Original: ${originalUserId}`);
          
          // Intentar restaurar la sesión original de forma asíncrona
          const originalTokens = localStorage.getItem('original_session_tokens');
          if (originalTokens) {
            try {
              const tokens = JSON.parse(originalTokens);
              const { data: restoredSession, error: restoreError } = await supabase.auth.setSession({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
              });
              
              if (!restoreError && restoredSession?.session && restoredSession.session.user.id === originalUserId) {
                console.log("✅ Sesión original restaurada desde onAuthStateChange");
                // Actualizar el estado con la sesión restaurada
                setAuthenticated(true);
                setUser(restoredSession.session.user);
                setLoading(false);
                // Limpiar flags
                localStorage.removeItem('creating_user');
                localStorage.removeItem('original_user_id');
                localStorage.removeItem('original_session_tokens');
                localStorage.removeItem('creating_user_time');
                return;
              } else {
                console.error("Error restaurando sesión:", restoreError);
                // Si falla, limpiar flags y continuar con el flujo normal
                localStorage.removeItem('creating_user');
                localStorage.removeItem('original_user_id');
                localStorage.removeItem('original_session_tokens');
                localStorage.removeItem('creating_user_time');
              }
            } catch (e) {
              console.error("Error restaurando sesión desde listener:", e);
              // Limpiar flags en caso de error
              localStorage.removeItem('creating_user');
              localStorage.removeItem('original_user_id');
              localStorage.removeItem('original_session_tokens');
              localStorage.removeItem('creating_user_time');
            }
          }
          
          // No actualizar el estado si no es el usuario original y no se pudo restaurar
          // Pero asegurarse de que loading se actualice
          return;
        } else {
          // Si ya es el usuario original, limpiar el flag y continuar normalmente
          console.log("✅ Sesión restaurada correctamente, limpiando flags");
          localStorage.removeItem('creating_user');
          localStorage.removeItem('original_user_id');
          localStorage.removeItem('original_session_tokens');
          localStorage.removeItem('creating_user_time');
          // Continuar con el flujo normal (no hacer return aquí)
        }
      }
      
      // Solo actualizar si es un cambio real (no recarga)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        setAuthenticated(!!session);
        if (session) {
          // Si cambió el usuario, limpiar caché
          if (sessionCache.userId && sessionCache.userId !== session.user.id) {
            sessionCache.userId = null;
            sessionCache.isSuperAdmin = null;
            sessionCache.timestamp = null;
          }
          setUser(session.user);
          // Actualizar caché
          sessionStorage.setItem('auth_session', JSON.stringify({
            userId: session.user.id,
            expiresAt: Date.now() + (60 * 60 * 1000)
          }));
        } else {
          setAuthenticated(false);
          setUser(null);
          sessionStorage.removeItem('auth_session');
          sessionCache.userId = null;
          sessionCache.isSuperAdmin = null;
          sessionCache.timestamp = null;
        }
        setLoading(false);
      }
    });

    authListenerRef.current = subscription;

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, [authenticated]);

  // Verificar si necesita onboarding después de que carga la organización
  useEffect(() => {
    if (!loading && authenticated && !orgLoading && user) {
      // Si tiene organización, no mostrar onboarding
      if (organizacion) {
        setShowOnboarding(false);
        setIsSuperAdminUser(false);
        setCheckingSuperAdmin(false);
        return;
      }

      // Verificar caché de superadmin
      const isCached = sessionCache.userId === user.id && 
                      sessionCache.isSuperAdmin !== null &&
                      sessionCache.timestamp && 
                      (Date.now() - sessionCache.timestamp) < sessionCache.CACHE_DURATION;

      if (isCached) {
        setIsSuperAdminUser(sessionCache.isSuperAdmin);
        setCheckingSuperAdmin(false);
        if (sessionCache.isSuperAdmin) {
          setShowOnboarding(false);
          return;
        }
      } else {
        // Si no tiene organización, verificar si es superadmin primero
        setCheckingSuperAdmin(true);
        setShowOnboarding(false);

        esSuperAdmin(user.id)
          .then((isAdmin) => {
            // Guardar en caché
            sessionCache.userId = user.id;
            sessionCache.isSuperAdmin = isAdmin;
            sessionCache.timestamp = Date.now();
            
            setIsSuperAdminUser(isAdmin);
            setCheckingSuperAdmin(false);
            
            if (isAdmin) {
              setShowOnboarding(false);
              return;
            }
            
            // Si no es superadmin, verificar si el usuario existe en el sistema
            getUsuarioSistema(user.id)
              .then((usuarioSistema) => {
                if (!usuarioSistema || !usuarioSistema.organizacionId) {
                  setShowOnboarding(true);
                } else {
                  setShowOnboarding(false);
                }
              })
              .catch((err) => {
                console.error("❌ Error obteniendo usuario:", err);
                setShowOnboarding(true);
              });
          })
          .catch((err) => {
            console.error("❌ Error verificando superadmin:", err);
            setCheckingSuperAdmin(false);
            setIsSuperAdminUser(false);
            getUsuarioSistema(user.id)
              .then((usuarioSistema) => {
                if (!usuarioSistema || !usuarioSistema.organizacionId) {
                  setShowOnboarding(true);
                }
              })
              .catch(() => {
                setShowOnboarding(true);
              });
          });
      }
    }
  }, [loading, authenticated, orgLoading, organizacion, user]);

  const handleSkipPassword = () => {
    if (user) {
      localStorage.setItem(`password_skipped_${user.id}`, 'true');
    }
    setShowPasswordModal(false);
  };

  const handlePasswordSet = () => {
    if (user) {
      localStorage.removeItem(`password_skipped_${user.id}`);
    }
    setShowPasswordModal(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Recargar la organización después del onboarding
    window.location.reload();
  };

  // Timeout de seguridad: si loading lleva más de 8 segundos, forzar actualización
  useEffect(() => {
    if (loading || orgLoading) {
      const timeout = setTimeout(() => {
        console.warn("⚠️ Timeout de carga, forzando actualización de estado");
        setLoading(false);
        // Si hay sesión en caché, usarla
        const cachedSession = sessionStorage.getItem('auth_session');
        if (cachedSession) {
          try {
            const parsed = JSON.parse(cachedSession);
            if (parsed.expiresAt > Date.now()) {
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session && session.user.id === parsed.userId) {
                  setAuthenticated(true);
                  setUser(session.user);
                  return;
                }
              });
            }
          } catch (e) {
            // Continuar con verificación normal
          }
        }
        // Verificar sesión nuevamente
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setAuthenticated(true);
            setUser(session.user);
          } else {
            setAuthenticated(false);
            setUser(null);
          }
        });
      }, 8000); // 8 segundos

      return () => clearTimeout(timeout);
    }
  }, [loading, orgLoading]);

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero aún no se ha verificado si es superadmin o tiene organización
  // Mostrar loading mientras se verifica
  if (checkingSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene organización y no es superadmin, mostrar onboarding
  // PERO permitir que el contenido se renderice para que el modal se muestre
  // No redirigir al login si está autenticado

  return (
    <>
      {children}
      {showPasswordModal && (
        <SetPasswordModal
          onClose={handleSkipPassword}
          onSuccess={handlePasswordSet}
        />
      )}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}

