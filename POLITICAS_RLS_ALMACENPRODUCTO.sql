-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA ALMACENPRODUCTO
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Los usuarios solo puedan ver registros de su organización
-- 3. Solo el ADMINISTRADOR de la organización (y SUPERADMIN) puede crear/actualizar/eliminar
-- 4. La eliminación es "soft delete" (cambia estadoAlmacenProducto a false) mediante UPDATE
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

-- Función helper para verificar si un usuario es ADMINISTRADOR de organización
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin_organizacion' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION is_admin_organizacion(user_id UUID)
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
      
      -- Verificar si tiene el rol ADMINISTRADOR
      PERFORM set_config('row_security', 'off', true);
      
      SELECT EXISTS(
        SELECT 1
        FROM "USUARIOROL" ur
        INNER JOIN "ROL" r ON ur."idRol" = r."idRol"
        WHERE ur."idUsuario" = id_usuario
        AND ur."estadoUsuarioRol" = true
        AND r."estadoRol" = true
        AND r."nombreRol" = 'ADMINISTRADOR'
      ) INTO es_admin;
      
      PERFORM set_config('row_security', 'on', true);
      
      RETURN es_admin;
    END;
    $$;
  END IF;
END $$;

-- =====================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todos los almacenproductos" ON "ALMACENPRODUCTO";
DROP POLICY IF EXISTS "Usuarios pueden ver almacenproductos de su organización" ON "ALMACENPRODUCTO";
DROP POLICY IF EXISTS "Admins pueden crear almacenproductos de su organización" ON "ALMACENPRODUCTO";
DROP POLICY IF EXISTS "Admins pueden actualizar almacenproductos de su organización" ON "ALMACENPRODUCTO";
DROP POLICY IF EXISTS "Admins pueden eliminar almacenproductos de su organización" ON "ALMACENPRODUCTO";

-- =====================================================
-- HABILITAR RLS EN LA TABLA ALMACENPRODUCTO
-- =====================================================
ALTER TABLE "ALMACENPRODUCTO" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todos los registros
-- =====================================================
CREATE POLICY "Superadmins pueden ver todos los almacenproductos"
ON "ALMACENPRODUCTO"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Usuarios pueden ver registros de su organización
-- =====================================================
CREATE POLICY "Usuarios pueden ver almacenproductos de su organización"
ON "ALMACENPRODUCTO"
FOR SELECT
TO authenticated
USING (
  "idOrganizacion" = get_user_organizacion_id(auth.uid())
  AND "estadoAlmacenProducto" = true
);

-- =====================================================
-- POLÍTICA 3: Solo ADMINISTRADOR de la organización (y SUPERADMIN) pueden crear registros
-- =====================================================
CREATE POLICY "Admins pueden crear almacenproductos de su organización"
ON "ALMACENPRODUCTO"
FOR INSERT
TO authenticated
WITH CHECK (
  (
    "idOrganizacion" = get_user_organizacion_id(auth.uid())
    AND is_admin_organizacion(auth.uid())
  )
  OR is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Solo ADMINISTRADOR de la organización (y SUPERADMIN) pueden actualizar registros
-- =====================================================
CREATE POLICY "Admins pueden actualizar almacenproductos de su organización"
ON "ALMACENPRODUCTO"
FOR UPDATE
TO authenticated
USING (
  (
    "idOrganizacion" = get_user_organizacion_id(auth.uid())
    AND is_admin_organizacion(auth.uid())
  )
  OR is_superadmin(auth.uid())
)
WITH CHECK (
  (
    "idOrganizacion" = get_user_organizacion_id(auth.uid())
    AND is_admin_organizacion(auth.uid())
  )
  OR is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 5: Solo ADMINISTRADOR de la organización (y SUPERADMIN) pueden eliminar registros (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoAlmacenProducto a false)
-- Por lo tanto, se usa la política de UPDATE

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD) sobre ALMACENPRODUCTO
-- 2. Los usuarios normales solo pueden ver registros activos de su propia organización
-- 3. Solo el rol ADMINISTRADOR (de la organización) puede crear/actualizar/eliminar registros de su organización
-- 4. La eliminación lógica (soft delete) se implementa marcando estadoAlmacenProducto = false vía UPDATE

