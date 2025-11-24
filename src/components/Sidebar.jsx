import { NavLink } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, onClose }) {
  const { isSuperAdmin, tienePermiso, loading } = usePermissions();

  // Cerrar sidebar al hacer clic fuera en móvil
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        if (sidebar && !sidebar.contains(event.target) && menuButton && !menuButton.contains(event.target)) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (loading) {
    return (
      <aside 
        id="sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#2B3E3C] text-white flex flex-col p-4 space-y-2 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">ALL-SHOP</h2>
          <button
            onClick={onClose}
            className="md:hidden text-white hover:text-gray-300 p-2"
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        id="sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#2B3E3C] text-white flex flex-col p-4 space-y-2 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">ALL-SHOP</h2>
          <button
            onClick={onClose}
            className="md:hidden text-white hover:text-gray-300 p-2"
            aria-label="Cerrar menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
    </>
  );
}
