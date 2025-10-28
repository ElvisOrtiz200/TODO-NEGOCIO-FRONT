
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";


export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-3">
      <h1 className="text-lg font-semibold text-gray-700">Panel de Control</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Cerrar sesión
      </button>
    </header>
  );
}
