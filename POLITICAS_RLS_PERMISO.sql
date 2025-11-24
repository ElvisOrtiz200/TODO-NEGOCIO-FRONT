-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA PERMISO
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Todos los usuarios autenticados puedan ver permisos activos
-- =====================================================

-- Función helper para verificar si un usuario es superadmin
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

-- =====================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todos los permisos" ON "PERMISO";
DROP POLICY IF EXISTS "Superadmins pueden crear permisos" ON "PERMISO";
DROP POLICY IF EXISTS "Superadmins pueden actualizar permisos" ON "PERMISO";
DROP POLICY IF EXISTS "Superadmins pueden eliminar permisos" ON "PERMISO";
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver permisos activos" ON "PERMISO";

-- =====================================================
-- HABILITAR RLS EN LA TABLA PERMISO
-- =====================================================
ALTER TABLE "PERMISO" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todos los permisos
-- =====================================================
CREATE POLICY "Superadmins pueden ver todos los permisos"
ON "PERMISO"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Todos los usuarios autenticados pueden ver permisos activos
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver permisos activos"
ON "PERMISO"
FOR SELECT
TO authenticated
USING (
  "estadoPermiso" = true
);

-- =====================================================
-- POLÍTICA 3: Superadmins pueden crear permisos
-- =====================================================
CREATE POLICY "Superadmins pueden crear permisos"
ON "PERMISO"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Superadmins pueden actualizar permisos
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar permisos"
ON "PERMISO"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 5: Superadmins pueden eliminar permisos (soft delete)
-- =====================================================
CREATE POLICY "Superadmins pueden eliminar permisos"
ON "PERMISO"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

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
WHERE tablename = 'PERMISO'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD)
-- 2. Los usuarios normales solo pueden ver permisos activos
-- 3. La eliminación es "soft delete" (cambia estadoPermiso a false)
-- 4. La función is_superadmin usa SECURITY DEFINER para evitar recursión

