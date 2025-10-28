import { supabase } from "../api/supabaseClient";

export default function LoginPage() {
  const handleLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: "http://localhost:5173/home" },
    });

    if (error) {
      console.log("Error en login: ", error.message);
    }
  };

return (
  <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md w-full max-w-sm border border-gray-100">
    <h1 className="text-2xl font-semibold text-[#2B3E3C] mb-2 text-center">
      Bienvenido 
    </h1>
    <p className="text-gray-500 mb-8 text-center text-sm">
      Accede con tu cuenta de Google
    </p>

    <button
      onClick={() => handleLogin("google")}
      className="flex items-center justify-center gap-2 bg-[#2B3E3C] hover:bg-[#22312f] text-white font-medium px-5 py-3 rounded-xl transition-all duration-300 w-full"
    >
      <img
        src="/google-logo.jpg"
        alt="Google"
        className="w-5 h-5 object-contain"
      />
      Iniciar sesión con Google
    </button>
  </div>
</div>

  );
}
