-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA UNIDADMEDIDA
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Todos los usuarios autenticados pueden VER las unidades de medida
-- 2. Solo los superadmins pueden CREAR, ACTUALIZAR y ELIMINAR
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

-- =====================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todas las unidades de medida" ON "UNIDADMEDIDA";
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver unidades de medida" ON "UNIDADMEDIDA";
DROP POLICY IF EXISTS "Superadmins pueden crear unidades de medida" ON "UNIDADMEDIDA";
DROP POLICY IF EXISTS "Superadmins pueden actualizar unidades de medida" ON "UNIDADMEDIDA";
DROP POLICY IF EXISTS "Superadmins pueden eliminar unidades de medida" ON "UNIDADMEDIDA";

-- =====================================================
-- HABILITAR RLS EN LA TABLA UNIDADMEDIDA
-- =====================================================
ALTER TABLE "UNIDADMEDIDA" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Todos los usuarios autenticados pueden ver unidades de medida
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver unidades de medida"
ON "UNIDADMEDIDA"
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- POLÍTICA 2: Solo superadmins pueden crear unidades de medida
-- =====================================================
CREATE POLICY "Superadmins pueden crear unidades de medida"
ON "UNIDADMEDIDA"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 3: Solo superadmins pueden actualizar unidades de medida
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar unidades de medida"
ON "UNIDADMEDIDA"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Solo superadmins pueden eliminar unidades de medida
-- =====================================================
CREATE POLICY "Superadmins pueden eliminar unidades de medida"
ON "UNIDADMEDIDA"
FOR DELETE
TO authenticated
USING (
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
WHERE tablename = 'UNIDADMEDIDA'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Todos los usuarios autenticados pueden VER las unidades de medida (necesario para formularios)
-- 2. Solo los superadmins pueden CREAR, ACTUALIZAR y ELIMINAR unidades de medida
-- 3. La función is_superadmin usa SECURITY DEFINER para evitar recursión
-- 4. La eliminación es física (DELETE), no soft delete

