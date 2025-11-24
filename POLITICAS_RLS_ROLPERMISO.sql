-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA ROLPERMISO
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Todos los usuarios autenticados puedan ver relaciones activas
-- =====================================================

-- Función helper para verificar si un usuario es superadmin
-- (Reutilizar la función si ya existe, si no, crearla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_superadmin' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      es_admin BOOLEAN := false;
    BEGIN
      SELECT EXISTS(
        SELECT 1
        FROM "USUARIOROL" ur
        INNER JOIN "ROL" r ON ur."idRol" = r."idRol"
        WHERE ur."idUsuario" = (
          SELECT "idUsuario" 
          FROM "USUARIO" 
          WHERE "authUserId" = user_id 
          AND "estadoUsuario" = true
          LIMIT 1
        )
        AND ur."estadoUsuarioRol" = true
        AND r."estadoRol" = true
        AND (r."nombreRol" = 'SUPERADMIN' OR r."idRol" = 1)
      ) INTO es_admin;
      
      RETURN es_admin;
    END;
    $$;
  END IF;
END $$;

-- =====================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todas las relaciones rol-permiso" ON "ROLPERMISO";
DROP POLICY IF EXISTS "Superadmins pueden crear relaciones rol-permiso" ON "ROLPERMISO";
DROP POLICY IF EXISTS "Superadmins pueden actualizar relaciones rol-permiso" ON "ROLPERMISO";
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver relaciones activas" ON "ROLPERMISO";

-- =====================================================
-- HABILITAR RLS EN LA TABLA ROLPERMISO
-- =====================================================
ALTER TABLE "ROLPERMISO" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todas las relaciones
-- =====================================================
CREATE POLICY "Superadmins pueden ver todas las relaciones rol-permiso"
ON "ROLPERMISO"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Todos los usuarios autenticados pueden ver relaciones activas
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver relaciones activas"
ON "ROLPERMISO"
FOR SELECT
TO authenticated
USING (
  "estadoRolPermiso" = true
);

-- =====================================================
-- POLÍTICA 3: Superadmins pueden crear relaciones rol-permiso
-- =====================================================
CREATE POLICY "Superadmins pueden crear relaciones rol-permiso"
ON "ROLPERMISO"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Superadmins pueden actualizar relaciones rol-permiso
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar relaciones rol-permiso"
ON "ROLPERMISO"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 5: Superadmins pueden eliminar relaciones (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoRolPermiso a false)
-- Por lo tanto, se usa la política de UPDATE

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ROLPERMISO'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD)
-- 2. Los usuarios normales solo pueden ver relaciones activas
-- 3. La eliminación es "soft delete" (cambia estadoRolPermiso a false)
-- 4. La función is_superadmin usa SECURITY DEFINER para evitar recursión

