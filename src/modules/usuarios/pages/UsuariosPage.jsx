import { useState, useMemo, useEffect } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import UsuarioForm from "../components/UsuarioForm";
import { useOrganizacion } from "../../../context/OrganizacionContext";
import { usePermissions } from "../../../hooks/usePermissions";
import { asignarRolesAUsuario, getRolesByUsuario } from "../services/usuarioRolService";
import { useToast } from "../../../components/ToastContainer";
import { actualizarAutorizacionSuperadmin, getOrganizaciones } from "../../organizaciones/services/organizacionService";

export default function UsuariosPage() {
  const { organizacion, usuario, actualizarOrganizacion, organizacionVista } = useOrganizacion();
  const { isSuperAdmin, loading: permissionsLoading, tienePermiso } = usePermissions();
  const { success, error: showError, warning } = useToast();
  // Si el superadmin está viendo una organización, usar esa organización; si no, y es superadmin, null; si no, la organización del usuario
  const organizacionId = organizacionVista 
    ? organizacionVista.idOrganizacion 
    : (isSuperAdmin ? null : (organizacion?.idOrganizacion || null));
  const { usuarios, loading, error, addUsuario, editUsuario, removeUsuario, reload } = useUsuarios(organizacionId);
  const [showForm, setShowForm] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [actualizandoAutorizacion, setActualizandoAutorizacion] = useState(false);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loadingOrganizaciones, setLoadingOrganizaciones] = useState(false);
  
  // Estados para filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroOrganizacion, setFiltroOrganizacion] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Cargar organizaciones solo si es superadmin y no está viendo una organización
  useEffect(() => {
    if (isSuperAdmin && !organizacionVista) {
      const loadOrganizaciones = async () => {
        try {
          setLoadingOrganizaciones(true);
          const data = await getOrganizaciones();
          setOrganizaciones(data || []);
        } catch (error) {
          console.error("Error al cargar organizaciones:", error);
          setOrganizaciones([]);
        } finally {
          setLoadingOrganizaciones(false);
        }
      };
      loadOrganizaciones();
    } else {
      setOrganizaciones([]);
    }
  }, [isSuperAdmin, organizacionVista]);

  const rolesDelUsuarioActual = useMemo(() => {
    if (!usuario?.roles) return [];
    return usuario.roles
      .filter((ur) => ur.estadoUsuarioRol)
      .map((ur) => ur.rol?.nombreRol?.toUpperCase())
      .filter(Boolean);
  }, [usuario]);

  // Determinar organización activa
  const orgActiva = organizacionVista || organizacion;
  const esAdministradorOrg = !isSuperAdmin && rolesDelUsuarioActual.includes("ADMINISTRADOR");
  const autorizadoSuperadmin = Boolean(orgActiva?.autorizaSuperadminUsuarios);
  // El superadmin puede crear usuarios cuando no está viendo una organización específica
  const puedeCrearUsuarios = (isSuperAdmin && !organizacionVista) || (esAdministradorOrg && tienePermiso("usuarios.crear"));
  const autorizacionActivaDesde = orgActiva?.autorizaSuperadminUsuariosDesde
    ? new Date(organizacion.autorizaSuperadminUsuariosDesde).toLocaleString()
    : null;

  const handleToggleAutorizacionSuperadmin = async () => {
    if (!orgActiva) return;

    try {
      setActualizandoAutorizacion(true);
      const nuevoValor = !autorizadoSuperadmin;
      await actualizarAutorizacionSuperadmin(
        orgActiva.idOrganizacion,
        nuevoValor,
        usuario?.idUsuario || null
      );

      await actualizarOrganizacion();
      success(
        nuevoValor
          ? "Autorizaste al superadmin para apoyar en la gestión de usuarios."
          : "Revocaste la autorización del superadmin para gestionar usuarios."
      );
    } catch (error) {
      console.error("Error actualizando autorización del superadmin:", error);
      showError("No se pudo actualizar la autorización. Intenta nuevamente.");
    } finally {
      setActualizandoAutorizacion(false);
    }
  };

  // Función para manejar la actualización de usuario desde el botón Editar
  const handleEditUsuario = async (usuario) => {
    try {
      // Extraer rolId para asignarlo después
      const { rolId, ...datosUsuario } = usuario;
      
      // Actualizar datos del usuario
      const resultado = await editUsuario(selectedUsuario.idUsuario, datosUsuario);
      if (resultado.success) {
        // Asignar rol solo si se proporcionó y es diferente al actual
        if (rolId) {
          try {
            // Obtener los roles actuales del usuario
            const rolesActuales = await getRolesByUsuario(selectedUsuario.idUsuario);
            const rolActualId = rolesActuales && rolesActuales.length > 0 
              ? rolesActuales.find(r => r.estadoUsuarioRol)?.idRol 
              : null;
            
            // Convertir a número para comparación
            const rolIdNum = parseInt(rolId);
            const rolActualIdNum = rolActualId ? parseInt(rolActualId) : null;
            
            // Solo asignar si el rol cambió o si no tiene rol asignado
            if (rolActualIdNum !== rolIdNum) {
              console.log(`🔄 Rol cambió de ${rolActualIdNum} a ${rolIdNum}, actualizando...`);
              await asignarRolesAUsuario(selectedUsuario.idUsuario, [rolIdNum]);
            } else {
              console.log(`ℹ️ El rol no cambió (${rolIdNum}), no se actualiza la asignación`);
            }
          } catch (rolError) {
            console.error("Error asignando rol:", rolError);
            const errorMsg = rolError?.message || rolError?.toString() || "Error desconocido";
            const errorCode = rolError?.code || "";
            
            // Mensaje más específico para errores de RLS o recursión
            if (errorCode === "42501" || errorCode === "42P17" || 
                errorMsg.includes("403") || errorMsg.includes("Forbidden") || 
                errorMsg.includes("row-level security") || errorMsg.includes("infinite recursion")) {
              showError("No tienes permisos para asignar roles. Solo los superadmins pueden realizar esta acción. Si eres superadmin, ejecuta el script POLITICAS_RLS_USUARIOROL.sql en Supabase.");
            } else {
              warning(`Usuario actualizado pero hubo un error al asignar el rol: ${errorMsg}`);
            }
          }
        } else {
          console.log("ℹ️ No se proporcionó rolId, no se actualiza la asignación de roles");
        }
        // Recargar la lista después de actualizar
        await reload();
        setShowForm(false);
        setSelectedUsuario(null);
        success("Usuario actualizado exitosamente");
      } else {
        showError(resultado.error || "Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      showError("Error al actualizar el usuario");
    }
  };

  // Función para manejar la creación de usuarios
  const handleSubmit = async (usuario) => {
    try {
      // Extraer rolId para asignarlo después
      const { rolId, ...datosUsuario } = usuario;
      
      // Si viene con idUsuario, significa que el usuario ya fue creado por el trigger
      // Solo asignar el rol si se proporcionó
      if (datosUsuario.idUsuario) {
        const idUsuario = typeof datosUsuario.idUsuario === 'string' 
          ? parseInt(datosUsuario.idUsuario, 10) 
          : datosUsuario.idUsuario;
        
        // Asignar rol si se proporcionó
        if (rolId && idUsuario) {
          try {
            await asignarRolesAUsuario(idUsuario, [rolId]);
          } catch (rolError) {
            console.error("Error asignando rol:", rolError);
            const errorMsg = rolError?.message || rolError?.toString() || "Error desconocido";
            
            // Mensaje más específico para errores 403 (RLS)
            if (errorMsg.includes("403") || errorMsg.includes("Forbidden") || errorMsg.includes("row-level security")) {
              showError("No tienes permisos para asignar roles. Solo los superadmins pueden realizar esta acción. Si eres superadmin, ejecuta el script POLITICAS_RLS_USUARIOROL.sql en Supabase.");
            } else {
              warning(`Usuario creado pero hubo un error al asignar el rol: ${errorMsg}`);
            }
          }
        }
        // Recargar la lista después de crear
        await reload();
        setShowForm(false);
        setSelectedUsuario(null);
        success("Usuario creado exitosamente");
      } else {
        // Crear nuevo usuario (si no fue creado por trigger)
        const resultado = await addUsuario(datosUsuario);
        
        if (resultado.success) {
          const idUsuario = resultado.data?.idUsuario;
          
          // Asignar rol si se proporcionó
          if (rolId && idUsuario) {
            try {
              await asignarRolesAUsuario(idUsuario, [rolId]);
            } catch (rolError) {
              console.error("Error asignando rol:", rolError);
              const errorMsg = rolError?.message || rolError?.toString() || "Error desconocido";
              
              // Mensaje más específico para errores 403 (RLS)
              if (errorMsg.includes("403") || errorMsg.includes("Forbidden") || errorMsg.includes("row-level security")) {
                showError("No tienes permisos para asignar roles. Solo los superadmins pueden realizar esta acción. Si eres superadmin, ejecuta el script POLITICAS_RLS_USUARIOROL.sql en Supabase.");
              } else {
                warning(`Usuario creado pero hubo un error al asignar el rol: ${errorMsg}`);
              }
            }
          }
          // Recargar la lista después de crear
          await reload();
          setShowForm(false);
          setSelectedUsuario(null);
          success("Usuario creado exitosamente");
        } else {
          showError(resultado.error || "Error al crear el usuario");
        }
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      showError("Error al guardar el usuario");
    }
  };

  // Obtener roles únicos para el filtro
  const rolesUnicos = useMemo(() => {
    const roles = usuarios
      .flatMap(usuario => {
        if (usuario.roles && usuario.roles.length > 0) {
          return usuario.roles
            .filter(ur => ur.estadoUsuarioRol)
            .map(ur => ur.rol?.nombreRol)
            .filter(Boolean);
        } else if (usuario.rol?.nombreRol) {
          return [usuario.rol.nombreRol];
        }
        return [];
      })
      .filter((rol, index, self) => self.indexOf(rol) === index);
    return roles.sort();
  }, [usuarios]);

  // Obtener organizaciones únicas para el filtro (solo para superadmin)
  const organizacionesUnicas = useMemo(() => {
    if (!isSuperAdmin) return [];
    const orgs = usuarios
      .map(usuario => usuario.organizacion?.nombreOrganizacion)
      .filter(Boolean)
      .filter((org, index, self) => self.indexOf(org) === index);
    return orgs.sort();
  }, [usuarios, isSuperAdmin]);

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      // Si es superadmin y NO está viendo una organización, solo mostrar administradores
      if (isSuperAdmin && !organizacionVista) {
        const tieneRolAdministrador = usuario.roles?.some(ur => 
          ur.estadoUsuarioRol && 
          (ur.rol?.nombreRol?.toUpperCase() === "ADMINISTRADOR" || ur.rol?.nombreRol?.toUpperCase() === "ADMIN")
        ) || usuario.rol?.nombreRol?.toUpperCase() === "ADMINISTRADOR" || usuario.rol?.nombreRol?.toUpperCase() === "ADMIN";
        
        if (!tieneRolAdministrador) {
          return false;
        }
      }
      
      const coincideNombre = filtroNombre === "" || 
        usuario.nombreUsuario?.toLowerCase().includes(filtroNombre.toLowerCase());
      const coincideEmail = filtroEmail === "" || 
        usuario.emailUsuario?.toLowerCase().includes(filtroEmail.toLowerCase());
      const coincideEstado = filtroEstado === "todos" || 
        (filtroEstado === "activo" && usuario.estadoUsuario) ||
        (filtroEstado === "inactivo" && !usuario.estadoUsuario);
      
      // Filtro por rol
      let coincideRol = filtroRol === "todos";
      if (!coincideRol) {
        if (usuario.roles && usuario.roles.length > 0) {
          coincideRol = usuario.roles
            .filter(ur => ur.estadoUsuarioRol)
            .some(ur => ur.rol?.nombreRol === filtroRol);
        } else if (usuario.rol?.nombreRol === filtroRol) {
          coincideRol = true;
        }
      }
      
      // Filtro por organización (solo para superadmin cuando NO está viendo una organización)
      const coincideOrganizacion = !isSuperAdmin || organizacionVista || filtroOrganizacion === "todos" || 
        usuario.organizacion?.nombreOrganizacion === filtroOrganizacion;
      
      return coincideNombre && coincideEmail && coincideRol && coincideOrganizacion && coincideEstado;
    });
  }, [usuarios, filtroNombre, filtroEmail, filtroRol, filtroOrganizacion, filtroEstado, isSuperAdmin, organizacionVista]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroEmail("");
    setFiltroRol("todos");
    setFiltroOrganizacion("todos");
    setFiltroEstado("todos");
  };

  const tieneFiltrosActivos = filtroNombre !== "" || filtroEmail !== "" || filtroRol !== "todos" || 
    filtroOrganizacion !== "todos" || filtroEstado !== "todos";

  // Permitir acceso a superadmin sin organización
  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no es superadmin y no tiene organización (ni está viendo una), mostrar mensaje
  if (!isSuperAdmin && !orgActiva) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p>Debes pertenecer a una organización para gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2B3E3C]">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {organizacionVista ? (
              <span>Viendo organización: {organizacionVista.nombreOrganizacion} (Solo lectura)</span>
            ) : isSuperAdmin ? (
              <span>Superadmin - Solo Administradores de organizaciones</span>
            ) : (
              <span>Organización: {organizacion?.nombreOrganizacion}</span>
            )}
          </p>
        </div>
        {!showForm && puedeCrearUsuarios && !organizacionVista && (
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedUsuario(null);
            }}
            className="bg-[#2B3E3C] text-white px-4 py-2 rounded-lg hover:bg-[#22312f] transition-colors"
          >
            + Nuevo Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {isSuperAdmin && !organizacionVista && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          A partir de ahora los administradores de cada organización son quienes crean usuarios y asignan roles.
          Solo podrás intervenir si el administrador te otorga autorización explícita desde su organización.
        </div>
      )}

      {esAdministradorOrg && !organizacionVista && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2B3E3C]">
                Autoriza al superadmin para apoyar en tu organización
              </p>
              <p className="text-sm text-gray-600">
                {autorizadoSuperadmin
                  ? "Actualmente el superadmin puede crear usuarios o asignar roles en tu organización."
                  : "Por defecto solo los administradores pueden crear usuarios. Puedes habilitar temporalmente al superadmin si necesitas soporte."}
              </p>
              {autorizadoSuperadmin && autorizacionActivaDesde && (
                <p className="text-xs text-gray-500 mt-1">
                  Autorización activa desde: {autorizacionActivaDesde}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggleAutorizacionSuperadmin}
              disabled={actualizandoAutorizacion}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                autorizadoSuperadmin
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-[#2B3E3C] text-white hover:bg-[#22312f]"
              } disabled:opacity-60`}
            >
              {actualizandoAutorizacion
                ? "Guardando..."
                : autorizadoSuperadmin
                  ? "Revocar autorización"
                  : "Autorizar al superadmin"}
            </button>
          </div>
        </div>
      )}

      {!isSuperAdmin && !esAdministradorOrg && orgActiva && !organizacionVista && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          Solo los usuarios con rol Administrador pueden crear o asignar usuarios dentro de la organización.
          Comunícate con tu Administrador si necesitas cambios.
        </div>
      )}

      {/* FORMULARIO - Solo si NO está viendo una organización */}
      {showForm && !organizacionVista ? (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedUsuario ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <UsuarioForm
            initialData={selectedUsuario}
            onSubmit={selectedUsuario ? handleEditUsuario : handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedUsuario(null);
            }}
            organizacionId={(organizacionVista || organizacion)?.idOrganizacion || null}
            organizacionNombre={(organizacionVista || organizacion)?.nombreOrganizacion || ""}
            isSuperAdmin={isSuperAdmin && !organizacionVista}
            organizaciones={organizaciones}
          />
        </div>
      ) : (
        <>
          {/* FILTROS */}
          <div className="bg-white rounded-xl shadow p-4 mb-6 border-l-4 border-[#2B3E3C]">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#2B3E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-semibold text-[#2B3E3C]">Filtros de Búsqueda</h3>
              {tieneFiltrosActivos && (
                <span className="ml-auto text-sm text-gray-600">
                  {usuariosFiltrados.length} de {usuarios.length} usuarios
                </span>
              )}
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 ${(isSuperAdmin && !organizacionVista) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
              {/* Filtro por Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Buscar por Nombre
                </label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre del usuario..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 Buscar por Email
                </label>
                <input
                  type="text"
                  value={filtroEmail}
                  onChange={(e) => setFiltroEmail(e.target.value)}
                  placeholder="Email del usuario..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                />
              </div>

              {/* Filtro por Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🎭 Rol
                </label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos los roles</option>
                  {rolesUnicos.map((rol) => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Organización (solo superadmin cuando NO está viendo una organización) */}
              {isSuperAdmin && !organizacionVista && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏢 Organización
                  </label>
                  <select
                    value={filtroOrganizacion}
                    onChange={(e) => setFiltroOrganizacion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                  >
                    <option value="todos">Todas</option>
                    {organizacionesUnicas.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📊 Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3E3C] focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>

            {tieneFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                🗑️ Limpiar Filtros
              </button>
            )}
          </div>

          {/* TABLA DE USUARIOS */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B3E3C]"></div>
              <p className="mt-4 text-gray-500">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {tieneFiltrosActivos 
                  ? "No se encontraron usuarios con los filtros aplicados." 
                  : (isSuperAdmin && !organizacionVista)
                    ? "No hay administradores registrados en el sistema." 
                    : "No hay usuarios registrados en esta organización."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2B3E3C] text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nombre</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Teléfono</th>
                    <th className="p-3 text-left">Rol</th>
                    <th className="p-3 text-left">Organización</th>
                    <th className="p-3 text-left">Estado</th>
                    {!organizacionVista && (
                      <th className="p-3 text-center">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.idUsuario} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">{usuario.idUsuario}</td>
                      <td className="p-3 font-medium">{usuario.nombreUsuario}</td>
                      <td className="p-3">{usuario.emailUsuario}</td>
                      <td className="p-3">{usuario.telefonoUsuario || "-"}</td>
                      <td className="p-3">
                        {usuario.roles && usuario.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {usuario.roles
                              .filter(ur => ur.estadoUsuarioRol)
                              .map((usuarioRol, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                                >
                                  {usuarioRol.rol?.nombreRol || "Sin nombre"}
                                </span>
                              ))}
                          </div>
                        ) : usuario.rol ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                            {usuario.rol.nombreRol}
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin rol</span>
                        )}
                      </td>
                      <td className="p-3">
                        {usuario.organizacion?.nombreOrganizacion || "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            usuario.estadoUsuario
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {usuario.estadoUsuario ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {!organizacionVista && (
                        <td className="p-3 text-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedUsuario(usuario);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar al usuario "${usuario.nombreUsuario}"?`)) {
                                removeUsuario(usuario.idUsuario);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}

