import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './routes/AppRouter.jsx'
import { OrganizacionProvider } from './context/OrganizacionContext.jsx'
import { ToastProvider } from './components/ToastContainer.jsx'
import { supabase } from './api/supabaseClient'

// Procesar el hash de OAuth antes de renderizar la app
// Esto asegura que Supabase procese correctamente el callback de OAuth
if (window.location.hash) {
  console.log("🔍 Hash detectado en URL, procesando OAuth callback...");
  const hash = window.location.hash;
  if (hash.includes('access_token') || hash.includes('error')) {
    // Supabase procesará automáticamente el hash
    // Solo necesitamos esperar a que lo procese
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("✅ Sesión establecida desde hash");
      }
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <OrganizacionProvider>
        <AppRouter />
      </OrganizacionProvider>
    </ToastProvider>
  </StrictMode>,
)
