-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA PROVEEDOR
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Los usuarios solo puedan ver/crear/actualizar proveedores de su organización
-- 3. Los usuarios solo pueden eliminar (soft delete) proveedores de su organización
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
  END IF;
END $$;

-- Función helper para obtener el idOrganizacion del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_organizacion_id(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  id_organizacion UUID;
BEGIN
  SELECT u."organizacionId" INTO id_organizacion
  FROM "USUARIO" u
  WHERE u."authUserId" = user_id
  AND u."estadoUsuario" = true
  LIMIT 1;
  
  RETURN id_organizacion;
END;
$$;

-- =====================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todos los proveedores" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Superadmins pueden crear proveedores" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Superadmins pueden actualizar proveedores" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Superadmins pueden eliminar proveedores" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Usuarios pueden ver proveedores de su organización" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Usuarios pueden crear proveedores en su organización" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Usuarios pueden actualizar proveedores de su organización" ON "PROVEEDOR";
DROP POLICY IF EXISTS "Usuarios pueden eliminar proveedores de su organización" ON "PROVEEDOR";

-- =====================================================
-- HABILITAR RLS EN LA TABLA PROVEEDOR
-- =====================================================
ALTER TABLE "PROVEEDOR" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todos los proveedores
-- =====================================================
CREATE POLICY "Superadmins pueden ver todos los proveedores"
ON "PROVEEDOR"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Usuarios pueden ver proveedores de su organización
-- =====================================================
CREATE POLICY "Usuarios pueden ver proveedores de su organización"
ON "PROVEEDOR"
FOR SELECT
TO authenticated
USING (
  "idOrganizacion" = get_user_organizacion_id(auth.uid())
  AND "estadoProveedor" = true
);

-- =====================================================
-- POLÍTICA 3: Superadmins pueden crear proveedores
-- =====================================================
CREATE POLICY "Superadmins pueden crear proveedores"
ON "PROVEEDOR"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Usuarios pueden crear proveedores en su organización
-- =====================================================
CREATE POLICY "Usuarios pueden crear proveedores en su organización"
ON "PROVEEDOR"
FOR INSERT
TO authenticated
WITH CHECK (
  "idOrganizacion" = get_user_organizacion_id(auth.uid())
  AND get_user_organizacion_id(auth.uid()) IS NOT NULL
);

-- =====================================================
-- POLÍTICA 5: Superadmins pueden actualizar proveedores
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar proveedores"
ON "PROVEEDOR"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 6: Usuarios pueden actualizar proveedores de su organización
-- =====================================================
CREATE POLICY "Usuarios pueden actualizar proveedores de su organización"
ON "PROVEEDOR"
FOR UPDATE
TO authenticated
USING (
  "idOrganizacion" = get_user_organizacion_id(auth.uid())
)
WITH CHECK (
  "idOrganizacion" = get_user_organizacion_id(auth.uid())
);

-- =====================================================
-- POLÍTICA 7: Superadmins pueden eliminar proveedores (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoProveedor a false)
-- Por lo tanto, se usa la política de UPDATE

-- =====================================================
-- POLÍTICA 8: Usuarios pueden eliminar proveedores de su organización (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoProveedor a false)
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
WHERE tablename = 'PROVEEDOR'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD)
-- 2. Los usuarios solo pueden ver proveedores activos de su organización
-- 3. Los usuarios solo pueden crear proveedores en su organización
-- 4. Los usuarios solo pueden actualizar proveedores de su organización
-- 5. La eliminación es "soft delete" (cambia estadoProveedor a false)
-- 6. La función is_superadmin usa SECURITY DEFINER para evitar recursión
-- 7. La función get_user_organizacion_id obtiene el UUID de la organización del usuario

