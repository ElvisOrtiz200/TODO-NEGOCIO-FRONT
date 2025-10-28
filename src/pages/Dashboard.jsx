// import { supabase } from "../api/supabaseClient";
// import { useNavigate, Outlet } from "react-router-dom";
// import { useEffect, useState } from "react";


export default function Dashboard() {
//  const [user, setUser] = useState(null);
//    const navigate = useNavigate();

  //  const handleLogout = async () => {
  //   await supabase.auth.signOut(); 
  //   navigate("/login"); 
  // };
 
  //  useEffect(() => {
   
  //    supabase.auth.getUser().then(({ data }) => {
  //      if (data.user) {
  //        setUser(data.user);
  //      } else {
  //        navigate("/login");
  //      }
  //    });
 
   
  //    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
  //      setUser(session?.user ?? null);
  //    });
 
  //    return () => authListener.subscription.unsubscribe();
  //  }, [navigate]);
 
   return (
     <div className="p-6">
       {/* {user ? (
         <>
           <h1 className="text-xl font-bold">Hola, {user.email}</h1>
           <button
             onClick={handleLogout}
             className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4"
           >
            Cerrar Sesión
           </button>
         </>
       ) : (
         <p>Cargando ...</p>
       )} */}
       <h1>Hola este es el dashboard</h1>
     </div>
   );
}















