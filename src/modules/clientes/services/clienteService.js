import { supabase } from "../../../api/supabaseClient";
import { asignarRolAUsuario } from "../../usuarios/services/usuarioRolService";

const TABLE = "USUARIO";

export const getClientes = async (idOrganizacion = null) => {
  // Asegurar que idOrganizacion sea string para comparaciones UUID
  const orgId = idOrganizacion ? String(idOrganizacion) : null;
  
  // Obtener usuarios con sus roles
  let query = supabase
    .from(TABLE)
    .select(`
      *,
      roles:USUARIOROL(
        estadoUsuarioRol,
        rol:ROL(
          nombreRol,
          estadoRol
        )
      )
    `)
    .eq("estadoUsuario", true);
  
  // Filtrar por organización si se proporciona
  if (orgId) {
    query = query.eq("organizacionId", orgId);
  }
  
  const { data, error } = await query.order("nombreUsuario", { ascending: true });
  
  if (error) throw error;
  
  // Filtrar solo usuarios que tengan el rol CLIENTE activo
  const usuariosConRolCliente = (data || []).filter(usuario => {
    if (!usuario.roles || !Array.isArray(usuario.roles)) {
      return false;
    }
    
    // Verificar si tiene el rol CLIENTE activo
    return usuario.roles.some(ur => 
      ur.estadoUsuarioRol === true &&
      ur.rol &&
      ur.rol.estadoRol === true &&
      ur.rol.nombreRol === "CLIENTE"
    );
  });
  
  // Mapear los campos de USUARIO a los campos que espera el frontend
  const clientesMapeados = usuariosConRolCliente.map(usuario => {
    // Dividir nombreUsuario en nombre y apellido si contiene espacio
    const nombreCompleto = usuario.nombreUsuario || "";
    const partesNombre = nombreCompleto.split(" ");
    const nombreCliente = partesNombre[0] || "";
    const apellidoCliente = partesNombre.slice(1).join(" ") || "";
    
    return {
      idCliente: usuario.idUsuario,
      nombreCliente: nombreCliente,
      apellidoCliente: apellidoCliente,
      emailCliente: usuario.emailUsuario || null,
      telefonoCliente: usuario.telefonoUsuario || null,
      estadoCliente: usuario.estadoUsuario,
      fechaRegistroCliente: usuario.fechaCreacion || null,
      // Mantener datos originales del usuario por si se necesitan
      idUsuario: usuario.idUsuario,
      organizacionId: usuario.organizacionId,
      _usuarioOriginal: usuario, // Para referencia si se necesita
    };
  });
  
  return clientesMapeados;
};

export const createCliente = async (cliente) => {
  // Mapear campos del cliente a campos de USUARIO
  const nombreCompleto = `${cliente.nombreCliente || ""} ${cliente.apellidoCliente || ""}`.trim();
  
  const usuarioData = {
    nombreUsuario: nombreCompleto || cliente.nombreCliente || "",
    emailUsuario: cliente.emailCliente || null,
    telefonoUsuario: cliente.telefonoCliente || null,
    organizacionId: cliente.idOrganizacion || null,
    estadoUsuario: cliente.estadoCliente !== undefined ? cliente.estadoCliente : true,
    fechaCreacion: cliente.fechaRegistroCliente || new Date().toISOString(),
  };
  
  // Crear el usuario
  const { data: usuarioCreado, error: errorUsuario } = await supabase
    .from(TABLE)
    .insert([usuarioData])
    .select()
    .single();
  
  if (errorUsuario) throw errorUsuario;
  
  // Obtener el ID del rol CLIENTE
  const { data: rolCliente, error: errorRol } = await supabase
    .from("ROL")
    .select("idRol")
    .eq("nombreRol", "CLIENTE")
    .eq("estadoRol", true)
    .single();
  
  if (errorRol) {
    console.error("Error al obtener rol CLIENTE:", errorRol);
    // No lanzar error, el usuario ya fue creado
  } else if (rolCliente) {
    // Asignar el rol CLIENTE al usuario
    try {
      await asignarRolAUsuario(usuarioCreado.idUsuario, rolCliente.idRol);
      console.log("✅ Rol CLIENTE asignado al usuario:", usuarioCreado.idUsuario);
    } catch (errorAsignacion) {
      console.error("Error al asignar rol CLIENTE:", errorAsignacion);
      // No lanzar error, el usuario ya fue creado
    }
  }
  
  // Retornar el usuario mapeado como cliente
  const partesNombre = nombreCompleto.split(" ");
  return {
    idCliente: usuarioCreado.idUsuario,
    nombreCliente: partesNombre[0] || "",
    apellidoCliente: partesNombre.slice(1).join(" ") || "",
    emailCliente: usuarioCreado.emailUsuario || null,
    telefonoCliente: usuarioCreado.telefonoUsuario || null,
    estadoCliente: usuarioCreado.estadoUsuario,
    fechaRegistroCliente: usuarioCreado.fechaCreacion,
  };
};

export const updateCliente = async (idCliente, cliente) => {
  // Mapear campos del cliente a campos de USUARIO
  const nombreCompleto = `${cliente.nombreCliente || ""} ${cliente.apellidoCliente || ""}`.trim();
  
  const usuarioData = {
    nombreUsuario: nombreCompleto || cliente.nombreCliente || "",
    emailUsuario: cliente.emailCliente || null,
    telefonoUsuario: cliente.telefonoCliente || null,
    estadoUsuario: cliente.estadoCliente !== undefined ? cliente.estadoCliente : true,
  };
  
  // Actualizar el usuario
  const { data: usuarioActualizado, error } = await supabase
    .from(TABLE)
    .update(usuarioData)
    .eq("idUsuario", idCliente)
    .select()
    .single();
  
  if (error) throw error;
  
  // Retornar el usuario mapeado como cliente
  const partesNombre = nombreCompleto.split(" ");
  return {
    idCliente: usuarioActualizado.idUsuario,
    nombreCliente: partesNombre[0] || "",
    apellidoCliente: partesNombre.slice(1).join(" ") || "",
    emailCliente: usuarioActualizado.emailUsuario || null,
    telefonoCliente: usuarioActualizado.telefonoUsuario || null,
    estadoCliente: usuarioActualizado.estadoUsuario,
    fechaRegistroCliente: usuarioActualizado.fechaCreacion,
  };
};

export const deleteCliente = async (idCliente) => {
  // Soft delete: desactivar el usuario
  const { error } = await supabase
    .from(TABLE)
    .update({ estadoUsuario: false })
    .eq("idUsuario", idCliente);
  
  if (error) throw error;
};

