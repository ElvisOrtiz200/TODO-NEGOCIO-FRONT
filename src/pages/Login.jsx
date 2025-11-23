import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    let mounted = true;
    let redirecting = false;
    
    // Manejar el callback de OAuth
    const handleAuthCallback = async () => {
      try {
        // Verificar si hay parámetros de OAuth en la URL
        const hashParams = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error') || searchParams.get('error_description');
        
        console.log("🔍 Verificando callback OAuth:", { 
          hash: hashParams, 
          code, 
          errorParam,
          fullUrl: window.location.href 
        });
        
        // Si hay error en la URL, mostrarlo
        if (errorParam) {
          console.error("❌ Error en callback OAuth:", errorParam);
          setError(`Error al autenticarse con Google: ${errorParam}`);
          // Limpiar la URL
          window.history.replaceState({}, document.title, "/login");
          return;
        }
        
        // Si hay hash (Supabase usa hash para tokens), procesarlo
        if (hashParams && hashParams.includes('access_token')) {
          console.log("🔄 Procesando hash de OAuth...");
          
          // Supabase debería procesar automáticamente el hash
          // Esperar un momento para que Supabase procese
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Verificar la sesión
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error && mounted && !redirecting) {
            console.log("✅ Sesión OAuth establecida desde hash, redirigiendo a /home");
            redirecting = true;
            // Limpiar la URL
            window.history.replaceState({}, document.title, "/home");
            navigate("/home", { replace: true });
            return;
          } else if (error) {
            console.error("❌ Error obteniendo sesión:", error);
          }
        }
        
        // Si hay código de OAuth, procesar la sesión
        if (code) {
          console.log("🔄 Procesando código de OAuth...");
          
          // Esperar un momento para que Supabase procese la sesión
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Verificar la sesión
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error && mounted && !redirecting) {
            console.log("✅ Sesión OAuth establecida desde código, redirigiendo a /home");
            redirecting = true;
            // Limpiar la URL
            window.history.replaceState({}, document.title, "/home");
            navigate("/home", { replace: true });
            return;
          } else if (error) {
            console.error("❌ Error obteniendo sesión:", error);
          }
        }
        
        // Verificar si ya hay una sesión activa (no viene de OAuth)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted && !redirecting) {
          console.log("✅ Sesión existente encontrada, redirigiendo a /home");
          redirecting = true;
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("❌ Error en handleAuthCallback:", err);
      }
    };
    
    handleAuthCallback();
    
    // También escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        
        // Si el usuario se autenticó, redirigir
        if (event === 'SIGNED_IN' && session && mounted && !redirecting) {
          console.log("✅ Usuario autenticado (SIGNED_IN), redirigiendo a /home");
          redirecting = true;
          // Limpiar hash de la URL si existe
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          // Pequeño delay para asegurar que todo está listo
          setTimeout(() => {
            if (mounted) {
              navigate("/home", { replace: true });
            }
          }, 500);
        }
      }
    );
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        navigate("/home");
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, intente nuevamente.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Iniciando autenticación con Google...");
      console.log("📍 URL actual:", window.location.href);
      console.log("📍 Origin:", window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
          skipBrowserRedirect: false, // Asegurar que redirija
        },
      });

      if (error) {
        console.error("❌ Error en OAuth:", error);
        setError(error.message);
        setLoading(false);
      } else {
        // Si no hay error, Supabase redirigirá automáticamente a Google
        // No necesitamos hacer nada más aquí, el usuario será redirigido
        console.log("🔄 Redirigiendo a Google...", data);
        // No establecer loading a false porque el usuario será redirigido
        // El usuario será redirigido automáticamente por Supabase
      }
    } catch (err) {
      console.error("❌ Error al iniciar sesión con Google:", err);
      setError("Error al iniciar sesión con Google. Por favor, intente nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B3E3C] via-[#22312f] to-[#1a2523] flex">
      {/* Sección izquierda - Logo y título */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 text-white">
        <div className="max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 border border-white/20">
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-3">ALL-SHOP</h1>
            <p className="text-xl text-gray-200 mb-2">Sistema de Gestión Empresarial</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plataforma integral para la gestión de tu negocio. 
              Controla inventarios, ventas, compras y más desde un solo lugar.
            </p>
          </div>
          
          {/* Características destacadas */}
          <div className="mt-12 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Gestión completa de inventario</p>
                <p className="text-sm text-gray-300">Controla tu stock en tiempo real</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Reportes y análisis</p>
                <p className="text-sm text-gray-300">Toma decisiones basadas en datos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Multi-usuario y roles</p>
                <p className="text-sm text-gray-300">Gestiona permisos de forma segura</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección derecha - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo y título para móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg mb-4 border border-white/20">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ALL-SHOP</h1>
            <p className="text-gray-300 text-sm">Sistema de Gestión Empresarial</p>
          </div>

          {/* Formulario de login */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h2>
              <p className="text-gray-600 text-sm">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="usuario@empresa.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me y forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#2B3E3C] focus:ring-[#2B3E3C]"
                  />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-[#2B3E3C] hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B3E3C] hover:bg-[#22312f] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Google login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                ¿Necesitas ayuda?{" "}
                <a href="#" className="text-[#2B3E3C] hover:underline font-medium">
                  Contacta soporte
                </a>
              </p>
            </div>
          </div>

          {/* Copyright para móvil */}
          <div className="mt-6 text-center lg:hidden">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ALL-SHOP. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

