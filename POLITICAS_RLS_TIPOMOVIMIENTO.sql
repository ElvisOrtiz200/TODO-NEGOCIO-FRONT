-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA TIPOMOVIMIENTO
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Todos los usuarios autenticados puedan ver tipos de movimiento activos
-- 3. Los usuarios de una organización pueden crear/actualizar tipos de movimiento
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
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  id_organizacion INTEGER;
BEGIN
  SELECT u."idOrganizacion" INTO id_organizacion
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
DROP POLICY IF EXISTS "Superadmins pueden ver todos los tipos de movimiento" ON "TIPOMOVIMIENTO";
DROP POLICY IF EXISTS "Superadmins pueden crear tipos de movimiento" ON "TIPOMOVIMIENTO";
DROP POLICY IF EXISTS "Superadmins pueden actualizar tipos de movimiento" ON "TIPOMOVIMIENTO";
DROP POLICY IF EXISTS "Superadmins pueden eliminar tipos de movimiento" ON "TIPOMOVIMIENTO";
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver tipos de movimiento activos" ON "TIPOMOVIMIENTO";
DROP POLICY IF EXISTS "Usuarios pueden crear tipos de movimiento" ON "TIPOMOVIMIENTO";
DROP POLICY IF EXISTS "Usuarios pueden actualizar tipos de movimiento de su organización" ON "TIPOMOVIMIENTO";

-- =====================================================
-- HABILITAR RLS EN LA TABLA TIPOMOVIMIENTO
-- =====================================================
ALTER TABLE "TIPOMOVIMIENTO" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todos los tipos de movimiento
-- =====================================================
CREATE POLICY "Superadmins pueden ver todos los tipos de movimiento"
ON "TIPOMOVIMIENTO"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Todos los usuarios autenticados pueden ver tipos de movimiento activos
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver tipos de movimiento activos"
ON "TIPOMOVIMIENTO"
FOR SELECT
TO authenticated
USING (
  "estadoTipoMovimiento" = true
);

-- =====================================================
-- POLÍTICA 3: Superadmins pueden crear tipos de movimiento
-- =====================================================
CREATE POLICY "Superadmins pueden crear tipos de movimiento"
ON "TIPOMOVIMIENTO"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Usuarios autenticados pueden crear tipos de movimiento
-- (Si la tabla tiene idOrganizacion, se puede filtrar por organización)
-- =====================================================
CREATE POLICY "Usuarios pueden crear tipos de movimiento"
ON "TIPOMOVIMIENTO"
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir si el usuario tiene una organización válida
  -- O si no hay campo idOrganizacion, permitir a todos los usuarios autenticados
  get_user_organizacion_id(auth.uid()) IS NOT NULL
  OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'TIPOMOVIMIENTO' 
    AND column_name = 'idOrganizacion'
  )
);

-- =====================================================
-- POLÍTICA 5: Superadmins pueden actualizar tipos de movimiento
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar tipos de movimiento"
ON "TIPOMOVIMIENTO"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 6: Usuarios pueden actualizar tipos de movimiento de su organización
-- (Solo si la tabla tiene idOrganizacion)
-- =====================================================
-- Nota: Esta política solo se aplica si la tabla TIPOMOVIMIENTO tiene el campo idOrganizacion
-- Si no tiene este campo, solo los superadmins pueden actualizar

-- =====================================================
-- POLÍTICA 7: Superadmins pueden eliminar tipos de movimiento (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoTipoMovimiento a false)
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
WHERE tablename = 'TIPOMOVIMIENTO'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD)
-- 2. Los usuarios normales pueden ver tipos de movimiento activos
-- 3. Los usuarios autenticados pueden crear tipos de movimiento
-- 4. La eliminación es "soft delete" (cambia estadoTipoMovimiento a false)
-- 5. La función is_superadmin usa SECURITY DEFINER para evitar recursión
-- 6. Si la tabla TIPOMOVIMIENTO tiene idOrganizacion, se puede agregar filtrado por organización
-- 7. El nombre correcto de la tabla es TIPOMOVIMIENTO (singular)

