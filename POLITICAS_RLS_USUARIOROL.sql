-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA USUARIOROL
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Los usuarios autenticados puedan ver sus propios roles
-- 3. Los usuarios puedan ver roles de otros usuarios de su organización
-- =====================================================

-- Función helper para verificar si un usuario es superadmin
-- Esta función usa SECURITY DEFINER y deshabilita RLS temporalmente para evitar recursión
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  es_admin BOOLEAN := false;
  id_usuario INTEGER;
BEGIN
  -- Primero obtener el idUsuario
  SELECT "idUsuario" INTO id_usuario
  FROM "USUARIO"
  WHERE "authUserId" = user_id
  AND "estadoUsuario" = true
  LIMIT 1;
  
  -- Si no existe el usuario, retornar false
  IF id_usuario IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si tiene el rol SUPERADMIN
  -- Deshabilitar RLS temporalmente para evitar recursión infinita
  -- Solo dentro de esta función SECURITY DEFINER
  PERFORM set_config('row_security', 'off', true);
  
  SELECT EXISTS(
    SELECT 1
    FROM "USUARIOROL" ur
    INNER JOIN "ROL" r ON ur."idRol" = r."idRol"
    WHERE ur."idUsuario" = id_usuario
    AND ur."estadoUsuarioRol" = true
    AND r."estadoRol" = true
    AND (r."nombreRol" = 'SUPERADMIN' OR r."idRol" = 1)
  ) INTO es_admin;
  
  -- Restaurar RLS
  PERFORM set_config('row_security', 'on', true);
  
  RETURN es_admin;
END;
$$;

-- Función helper para obtener el idUsuario desde authUserId
CREATE OR REPLACE FUNCTION get_user_id_from_auth(auth_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id INTEGER;
BEGIN
  SELECT "idUsuario" INTO user_id
  FROM "USUARIO"
  WHERE "authUserId" = auth_user_id
  AND "estadoUsuario" = true
  LIMIT 1;
  
  RETURN user_id;
END;
$$;

-- =====================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todas las relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Superadmins pueden crear relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Superadmins pueden actualizar relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios roles" ON "USUARIOROL";
DROP POLICY IF EXISTS "Usuarios pueden ver roles de su organización" ON "USUARIOROL";

-- =====================================================
-- HABILITAR RLS EN LA TABLA USUARIOROL
-- =====================================================
ALTER TABLE "USUARIOROL" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todas las relaciones
-- =====================================================
CREATE POLICY "Superadmins pueden ver todas las relaciones usuario-rol"
ON "USUARIOROL"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Usuarios pueden ver sus propios roles
-- =====================================================
CREATE POLICY "Usuarios pueden ver sus propios roles"
ON "USUARIOROL"
FOR SELECT
TO authenticated
USING (
  "idUsuario" = get_user_id_from_auth(auth.uid())
);

-- =====================================================
-- POLÍTICA 3: Usuarios pueden ver roles de usuarios de su organización
-- =====================================================
CREATE POLICY "Usuarios pueden ver roles de usuarios de su organización"
ON "USUARIOROL"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "USUARIO" u1
    INNER JOIN "USUARIO" u2 ON u1."organizacionId" = u2."organizacionId"
    WHERE u1."authUserId" = auth.uid()
    AND u1."estadoUsuario" = true
    AND u2."idUsuario" = "USUARIOROL"."idUsuario"
    AND u2."estadoUsuario" = true
    AND u1."organizacionId" IS NOT NULL
  )
);

-- =====================================================
-- POLÍTICA 4: Superadmins pueden crear relaciones usuario-rol
-- =====================================================
-- Esta política permite a los superadmins insertar relaciones usuario-rol
-- La función is_superadmin usa SECURITY DEFINER para poder consultar USUARIOROL sin restricciones RLS
CREATE POLICY "Superadmins pueden crear relaciones usuario-rol"
ON "USUARIOROL"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- NOTA: Se eliminó la política alternativa que consultaba USUARIOROL directamente
-- porque causaba recursión infinita. La función is_superadmin ahora deshabilita
-- RLS temporalmente para evitar este problema.
-- =====================================================

-- =====================================================
-- POLÍTICA 5: Superadmins pueden actualizar relaciones usuario-rol
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar relaciones usuario-rol"
ON "USUARIOROL"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 6: Superadmins pueden eliminar relaciones (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoUsuarioRol a false)
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
WHERE tablename = 'USUARIOROL'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD)
-- 2. Los usuarios pueden ver sus propios roles
-- 3. Los usuarios pueden ver roles de otros usuarios de su organización
-- 4. La eliminación es "soft delete" (cambia estadoUsuarioRol a false)
-- 5. Las funciones is_superadmin y get_user_id_from_auth usan SECURITY DEFINER para evitar recursión

