import { NavLink } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

export default function Sidebar() {
  const { isSuperAdmin, tienePermiso, loading } = usePermissions();

  if (loading) {
    return (
      <aside className="w-64 bg-[#2B3E3C] text-white flex flex-col p-4 space-y-2">
        <h2 className="text-xl font-bold text-center mb-6">ALL-SHOP</h2>
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[#2B3E3C] text-white flex flex-col p-4 space-y-2">
      <h2 className="text-xl font-bold text-center mb-6">ALL-SHOP</h2>

      {/* DASHBOARD */}
      <NavLink
        to="/home/dashboard"
        end
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
            isActive ? "bg-[#22312f] font-semibold" : ""
          }`
        }
      >
        📊 Dashboard
      </NavLink>

      {/* Separador */}
      <div className="border-t border-gray-600 my-3"></div>

      {/* OPERACIONES */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        Operaciones
      </h3>
      
      {(isSuperAdmin || tienePermiso("ventas.ver")) && (
        <NavLink
          to="/home/ventas"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          💰 Ventas
        </NavLink>
      )}

      {(isSuperAdmin || tienePermiso("compras.ver")) && (
        <NavLink
          to="/home/compras"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🛒 Compras
        </NavLink>
      )}

      {/* Separador */}
      <div className="border-t border-gray-600 my-3"></div>

      {/* PRODUCTOS Y CATÁLOGO */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        Productos y Catálogo
      </h3>

      {(isSuperAdmin || tienePermiso("productos.ver")) && (
        <NavLink
          to="/home/productos"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          📦 Productos
        </NavLink>
      )}

      {(isSuperAdmin || tienePermiso("categorias.ver")) && (
        <NavLink
          to="/home/categorias"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🏷️ Categorías
        </NavLink>
      )}

      {/* Separador */}
      <div className="border-t border-gray-600 my-3"></div>

      {/* INVENTARIO */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        Inventario
      </h3>

      {(isSuperAdmin || tienePermiso("inventario.ver")) && (
        <NavLink
          to="/home/inventario"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          📋 Stock Actual
        </NavLink>
      )}

      {(isSuperAdmin || tienePermiso("inventario.ver_movimientos")) && (
        <NavLink
          to="/home/movimientos-inventario"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🔄 Movimientos
        </NavLink>
      )}

      {/* Separador */}
      <div className="border-t border-gray-600 my-3"></div>

      {/* DATOS MAESTROS */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        Datos Maestros
      </h3>

      {(isSuperAdmin || tienePermiso("clientes.ver")) && (
        <NavLink
          to="/home/clientes"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          👥 Clientes
        </NavLink>
      )}

      {(isSuperAdmin || tienePermiso("proveedores.ver")) && (
        <NavLink
          to="/home/proveedores"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🏢 Proveedores
        </NavLink>
      )}

      {(isSuperAdmin || tienePermiso("almacenes.ver")) && (
        <NavLink
          to="/home/almacenes"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🏪 Almacenes
        </NavLink>
      )}

      {/* Separador */}
      <div className="border-t border-gray-600 my-3"></div>

      {/* CONFIGURACIÓN */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        Configuración
      </h3>

      <NavLink
        to="/home/tipoMovimientos"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
            isActive ? "bg-[#22312f] font-semibold" : ""
          }`
        }
      >
        ⚙️ Tipo Movimientos
      </NavLink>

      {(isSuperAdmin || tienePermiso("roles.ver")) && (
        <NavLink
          to="/home/roles"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🔐 Roles
        </NavLink>
      )}

      {(isSuperAdmin || tienePermiso("configuracion.ver")) && (
        <NavLink
          to="/home/permisos"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          🔑 Permisos
        </NavLink>
      )}

      {/* Separador */}
      <div className="border-t border-gray-600 my-3"></div>

      {/* ADMINISTRACIÓN (Solo Superadmin) */}
      {isSuperAdmin && (
        <>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Administración
          </h3>

          <NavLink
            to="/home/organizaciones"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
                isActive ? "bg-[#22312f] font-semibold" : ""
              }`
            }
          >
            🏢 Organizaciones
          </NavLink>

          <NavLink
            to="/home/usuarios"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
                isActive ? "bg-[#22312f] font-semibold" : ""
              }`
            }
          >
            👥 Usuarios Sistema
          </NavLink>

          <NavLink
            to="/home/planes"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
                isActive ? "bg-[#22312f] font-semibold" : ""
              }`
            }
          >
            💳 Planes
          </NavLink>

          {/* Separador */}
          <div className="border-t border-gray-600 my-3"></div>
        </>
      )}

      {/* REPORTES */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
        Análisis
      </h3>

      {(isSuperAdmin || tienePermiso("reportes.ver")) && (
        <NavLink
          to="/home/reportes"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md hover:bg-[#22312f] transition-colors ${
              isActive ? "bg-[#22312f] font-semibold" : ""
            }`
          }
        >
          📈 Reportes
        </NavLink>
      )}
    </aside>
  );
}
