import { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { verificarEmailExistente } from "../services/authService";

export default function OnboardingModal({ onComplete }) {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const cargarEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
        }
      } catch (err) {
        console.error("Error obteniendo email:", err);
      }
    };

    cargarEmail();
  }, []);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-4">
          <div className="inline-block w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Acceso Pendiente
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Tu cuenta ha sido creada exitosamente.</strong>
            </p>
            <p className="text-sm text-blue-700">
              {userEmail && (
                <>
                  Has iniciado sesión con: <strong>{userEmail}</strong>
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>¿Qué sigue?</strong>
            </p>
            <p className="text-sm text-gray-600">
              Un administrador del sistema debe asignarte a una organización y configurar tus permisos antes de que puedas acceder al sistema.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Contacta con el administrador</strong>
            </p>
            <p className="text-sm text-yellow-700">
              Si necesitas acceso inmediato, contacta al administrador del sistema con tu email para que te asigne a una organización.
            </p>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

