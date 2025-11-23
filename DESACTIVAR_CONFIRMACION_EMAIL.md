# Desactivar Confirmación de Email en Supabase

Para que los usuarios creados por el superadmin puedan iniciar sesión inmediatamente sin confirmar email, sigue estos pasos:

## Opción 1: Desactivar Confirmación de Email (Recomendado)

1. Ve al Dashboard de Supabase
2. Ve a **Authentication** → **Settings**
3. Busca la sección **"Email Auth"** o **"Email Templates"**
4. Desactiva **"Enable email confirmations"** o **"Confirm email"**
5. Guarda los cambios

Esto permitirá que todos los usuarios puedan iniciar sesión sin confirmar su email.

## Opción 2: Confirmar Email Automáticamente con Trigger

Si necesitas mantener la confirmación de email activada para usuarios normales pero confirmarla automáticamente para usuarios creados por el superadmin, puedes crear un trigger SQL que confirme automáticamente el email.

**NOTA**: Esta opción requiere acceso a la base de datos con permisos de administrador.

## Opción 3: Usar Admin API (Solo Backend)

Si tienes un backend, puedes usar la Admin API de Supabase para confirmar emails automáticamente. Esto requiere la `service_role` key que **NO debe estar en el frontend**.

---

**Recomendación**: Usa la Opción 1 para desactivar la confirmación de email, ya que es la más simple y segura para un sistema donde el superadmin crea usuarios manualmente.

