import { useState, useEffect } from "react";
import { supabase } from "../../../api/supabaseClient";
import { useRoles } from "../../../modules/clientes/hooks/useRoles";
import { getRolesByUsuario } from "../services/usuarioRolService";

export default function UsuarioForm({ initialData, onSubmit, onCancel, organizacionId }) {
  const { roles } = useRoles();
  const [email, setEmail] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authUserId, setAuthUserId] = useState("");
  const [rolId, setRolId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState("");
  const [modoCrear, setModoCrear] = useState(!initialData); // Modo crear por defecto si no hay initialData

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.emailUsuario || initialData.email || "");
      setNombreUsuario(initialData.nombreUsuario || "");
      setAuthUserId(initialData.authUserId || "");
      setModoCrear(false); // Si hay datos, es modo edición
      
      // Cargar roles del usuario si tiene idUsuario
      if (initialData.idUsuario) {
        setLoadingRoles(true);
        getRolesByUsuario(initialData.idUsuario)
          .then(rolesUsuario => {
            if (rolesUsuario && rolesUsuario.length > 0) {
              // Tomar el primer rol activo
              const rolActivo = rolesUsuario.find(ur => ur.estadoUsuarioRol);
              setRolId(rolActivo ? rolActivo.idRol : (rolesUsuario[0]?.idRol || ""));
            }
          })
          .catch(err => {
            console.error("Error cargando roles:", err);
          })
          .finally(() => {
            setLoadingRoles(false);
          });
      } else {
        // Si no tiene idUsuario, usar rolId directo (compatibilidad)
        setRolId(initialData.rolId || "");
      }
    } else {
      // Si no hay initialData, es modo crear
      setModoCrear(true);
      setEmail("");
      setNombreUsuario("");
      setPassword("");
      setConfirmPassword("");
      setAuthUserId("");
      setRolId("");
    }
  }, [initialData]);

  const handleCrearUsuario = async () => {
    if (!email.trim()) {
      setError("Por favor ingresa un email");
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresa una contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!nombreUsuario.trim()) {
      setError("Por favor ingresa el nombre del usuario");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Guardar la sesión actual del superadmin antes de crear el usuario
      // Esto es necesario porque signUp automáticamente inicia sesión con el usuario creado
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession || !currentSession.user) {
        setError("No hay una sesión activa. Por favor, inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      // Guardar los tokens de la sesión actual para restaurarla después
      const originalAccessToken = currentSession.access_token;
      const originalRefreshToken = currentSession.refresh_token;
      const originalUserId = currentSession.user.id;
      const originalUserEmail = currentSession.user.email;

      // Marcar que estamos creando un usuario para evitar redirecciones
      // Guardar los tokens también en localStorage como respaldo
      localStorage.setItem('creating_user', 'true');
      localStorage.setItem('original_user_id', originalUserId);
      localStorage.setItem('creating_user_time', Date.now().toString());
      localStorage.setItem('original_session_tokens', JSON.stringify({
        access_token: originalAccessToken,
        refresh_token: originalRefreshToken
      }));

      // Crear usuario en Supabase Auth
      // NOTA: Para que el usuario pueda iniciar sesión inmediatamente sin confirmar email,
      // desactiva la confirmación en Supabase Dashboard > Authentication > Settings
      
      // Usar una promesa que restaure la sesión inmediatamente después del signUp
      let signUpPromise = supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: nombreUsuario.trim(),
            name: nombreUsuario.trim(),
          },
          email_redirect_to: `${window.location.origin}/login`,
        },
      });

      // Crear una promesa para restaurar la sesión que se ejecutará inmediatamente después
      const restorePromise = signUpPromise.then(async (signUpResult) => {
        // Restaurar la sesión INMEDIATAMENTE después de que se complete el signUp
        if (!signUpResult.error && signUpResult.data?.user) {
          // Restaurar la sesión original del superadmin de forma inmediata
          await supabase.auth.setSession({
            access_token: originalAccessToken,
            refresh_token: originalRefreshToken,
          });
          console.log("✅ Sesión restaurada inmediatamente después de signUp");
        }
        return signUpResult;
      });

      const { data, error: signUpError } = await restorePromise;

      if (signUpError) {
        localStorage.removeItem('creating_user');
        localStorage.removeItem('original_user_id');
        setError(signUpError.message || "Error al crear el usuario");
        setLoading(false);
        return;
      }

      if (!data.user) {
        localStorage.removeItem('creating_user');
        localStorage.removeItem('original_user_id');
        setError("Error al crear el usuario. No se obtuvo información del usuario creado.");
        setLoading(false);
        return;
      }
      
      // Verificar que la sesión actual sea la del superadmin
      const { data: { session: currentSessionCheck } } = await supabase.auth.getSession();
      if (currentSessionCheck && currentSessionCheck.user.id !== originalUserId) {
        console.warn("⚠️ La sesión no se restauró correctamente, intentando nuevamente...");
        await supabase.auth.setSession({
          access_token: originalAccessToken,
          refresh_token: originalRefreshToken,
        });
      }

      // El trigger automáticamente creará el registro en la tabla USUARIO
      // Esperar un momento para que el trigger se ejecute (hasta 3 intentos)
      let usuarioCreado = null;
      let intentos = 0;
      const maxIntentos = 5;
      
      while (!usuarioCreado && intentos < maxIntentos) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: usuario, error: usuarioError } = await supabase
          .from("USUARIO")
          .select("idUsuario, authUserId, emailUsuario, nombreUsuario")
          .eq("authUserId", data.user.id)
          .maybeSingle();

        if (!usuarioError && usuario) {
          usuarioCreado = usuario;
          break;
        }
        
        intentos++;
      }

      // Si después de los intentos no existe, intentar crearlo manualmente
      if (!usuarioCreado) {
        console.warn("El trigger no creó el usuario, intentando crear manualmente...");
        const { data: usuarioInsertado, error: insertError } = await supabase
          .from("USUARIO")
          .insert({
            authUserId: data.user.id,
            emailUsuario: email.trim(),
            nombreUsuario: nombreUsuario.trim(),
            estadoUsuario: true,
            organizacionId: organizacionId || null,
          })
          .select("idUsuario, authUserId, emailUsuario, nombreUsuario")
          .single();

        if (insertError) {
          // Si falla por duplicado, intentar obtenerlo
          if (insertError.code === "23505") {
            const { data: usuarioExistente } = await supabase
              .from("USUARIO")
              .select("idUsuario, authUserId, emailUsuario, nombreUsuario")
              .eq("authUserId", data.user.id)
              .single();
            usuarioCreado = usuarioExistente;
          } else {
            setError(`Usuario creado en Auth pero error al crear en sistema: ${insertError.message}`);
            setLoading(false);
            return;
          }
        } else {
          usuarioCreado = usuarioInsertado;
        }
      }

      if (!usuarioCreado) {
        setError("Error: No se pudo crear o encontrar el usuario en el sistema");
        setLoading(false);
        return;
      }

      // Actualizar organización y nombreUsuario si es necesario
      if (usuarioCreado.idUsuario) {
        const datosActualizar = {};
        if (organizacionId) {
          datosActualizar.organizacionId = organizacionId;
        }
        if (nombreUsuario.trim() && nombreUsuario.trim() !== usuarioCreado.nombreUsuario) {
          datosActualizar.nombreUsuario = nombreUsuario.trim();
        }
        
        if (Object.keys(datosActualizar).length > 0) {
          await supabase
            .from("USUARIO")
            .update(datosActualizar)
            .eq("idUsuario", usuarioCreado.idUsuario);
        }
      }

      // Restaurar la sesión del superadmin INMEDIATAMENTE después de crear el usuario
      // El listener en ProtectedRoute se encargará de restaurar automáticamente si es necesario
      // pero intentamos restaurar aquí primero para ser más rápidos
      if (originalAccessToken && originalRefreshToken && originalUserId) {
        // Restaurar inmediatamente sin cerrar sesión primero (más rápido)
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: originalAccessToken,
          refresh_token: originalRefreshToken,
        });

        if (sessionError) {
          console.error("❌ Error inicial al restaurar sesión:", sessionError);
          // El listener intentará restaurar automáticamente
        } else {
          // Verificar que se restauró correctamente
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession && currentSession.user.id === originalUserId) {
            console.log("✅ Sesión del superadmin restaurada correctamente");
            // Limpiar flags después de un momento para dar tiempo a que todo se sincronice
            setTimeout(() => {
              localStorage.removeItem('creating_user');
              localStorage.removeItem('original_user_id');
              localStorage.removeItem('original_session_tokens');
              localStorage.removeItem('creating_user_time');
            }, 1500);
          } else {
            console.warn("⚠️ La sesión no se restauró correctamente, el listener lo intentará");
            // El listener intentará restaurar automáticamente
          }
        }
      }

      setAuthUserId(data.user.id);
      setError("");
      
      // Continuar con el submit automáticamente
      onSubmit({
        authUserId: data.user.id,
        idUsuario: usuarioCreado.idUsuario,
        emailUsuario: email.trim(),
        nombreUsuario: nombreUsuario.trim(),
        organizacionId: organizacionId || null,
        rolId: rolId ? parseInt(rolId) : null,
        estadoUsuario: true,
      });
    } catch (err) {
      console.error("Error creando usuario:", err);
      setError(err.message || "Error al crear el usuario. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarUsuario = async () => {
    if (!email.trim()) {
      setError("Por favor ingresa un email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Buscar usuario en la tabla USUARIO
      const { data: usuarios, error: usuarioError } = await supabase
        .from("USUARIO")
        .select("authUserId, emailUsuario, nombreUsuario")
        .eq("emailUsuario", email.trim())
        .maybeSingle();

      if (usuarioError && usuarioError.code !== "PGRST116") {
        throw usuarioError;
      }

      if (usuarios) {
        setAuthUserId(usuarios.authUserId);
        setNombreUsuario(usuarios.nombreUsuario || email.split("@")[0]);
        setError("");
      } else {
        // Si no existe en USUARIO, buscar en auth.users (solo si tenemos acceso admin)
        try {
          const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
          
          if (!searchError && users) {
            const usuarioEncontrado = users.find(u => u.email === email.trim());
            if (usuarioEncontrado) {
              setAuthUserId(usuarioEncontrado.id);
              setNombreUsuario(usuarioEncontrado.user_metadata?.full_name || email.split("@")[0]);
              setError("");
            } else {
              setError("Usuario no encontrado. Puedes crear un nuevo usuario o el usuario debe autenticarse primero.");
            }
          } else {
            setError("Usuario no encontrado. Puedes crear un nuevo usuario usando el botón 'Crear Nuevo Usuario'.");
          }
        } catch (adminError) {
          setError("Usuario no encontrado. Puedes crear un nuevo usuario usando el botón 'Crear Nuevo Usuario'.");
        }
      }
    } catch (err) {
      console.error("Error buscando usuario:", err);
      setError("Error al buscar usuario. Puedes crear un nuevo usuario usando el botón 'Crear Nuevo Usuario'.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modoCrear) {
      // Si es modo crear, usar la función handleCrearUsuario
      handleCrearUsuario();
      return;
    }

    // Modo edición: debe tener authUserId
    if (!authUserId) {
      setError("Debes buscar el usuario primero");
      return;
    }

    onSubmit({
      authUserId,
      emailUsuario: email.trim(),
      nombreUsuario: nombreUsuario.trim(),
      organizacionId: organizacionId,
      rolId: rolId ? parseInt(rolId) : null, // Se usará para asignar el rol después
      estadoUsuario: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de modo */}
      {!initialData && (
        <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
          <button
            type="button"
            onClick={() => setModoCrear(true)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              modoCrear
                ? "bg-[#2B3E3C] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Crear Nuevo Usuario
          </button>
          <button
            type="button"
            onClick={() => setModoCrear(false)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              !modoCrear
                ? "bg-[#2B3E3C] text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Buscar Usuario Existente
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email del Usuario <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!initialData && !!initialData.authUserId}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="usuario@ejemplo.com"
          />
          {!modoCrear && !initialData && (
            <button
              type="button"
              onClick={handleBuscarUsuario}
              disabled={loading || !email.trim()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          )}
        </div>
        {!modoCrear && !initialData && (
          <p className="text-xs text-gray-500 mt-1">
            Busca un usuario que ya exista en el sistema
          </p>
        )}
      </div>

      {/* Campos de contraseña solo en modo crear */}
      {modoCrear && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
              placeholder="Repite la contraseña"
              minLength={6}
            />
          </div>
        </>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {authUserId && !modoCrear && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Usuario encontrado: {nombreUsuario}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Usuario <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
          placeholder="Nombre completo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rol
        </label>
        <select
          value={rolId}
          onChange={(e) => setRolId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
        >
          <option value="">Sin rol asignado</option>
          {roles.map((rol) => (
            <option key={rol.idRol} value={rol.idRol}>
              {rol.nombreRol}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || (!modoCrear && !authUserId)}
          className="px-4 py-2 bg-[#2B3E3C] text-white rounded-lg hover:bg-[#22312f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading 
            ? (modoCrear ? "Creando..." : "Guardando...") 
            : (initialData ? "Actualizar" : (modoCrear ? "Crear Usuario" : "Registrar"))
          }
        </button>
      </div>
    </form>
  );
}

