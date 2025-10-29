import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#2B3E3C] text-white flex flex-col p-4 space-y-4">
      <h2 className="text-xl font-bold text-center mb-6">ALL-SHOP</h2>

      <NavLink
        to="/home/dashboard"
        end
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] ${
            isActive ? "bg-[#22312f]" : ""
          }`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/home/productos"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] ${
            isActive ? "bg-[#22312f]" : ""
          }`
        }
      >
        Productos
      </NavLink>

      <NavLink
        to="/home/roles"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] ${
            isActive ? "bg-[#22312f]" : ""
          }`
        }
      >
        Roles
      </NavLink>
      <NavLink
        to="/home/categorias"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] ${
            isActive ? "bg-[#22312f]" : ""
          }`
        }
      >
        Categorias
      </NavLink>
      <NavLink
        to="/home/almacenes"
        className={({ isActive }) =>
          `px-4 py-2 rounded-md hover:bg-[#22312f] ${
            isActive ? "bg-[#22312f]" : ""
          }`
        }
      >
        Almacenes
      </NavLink>
    </aside>
  );
}
