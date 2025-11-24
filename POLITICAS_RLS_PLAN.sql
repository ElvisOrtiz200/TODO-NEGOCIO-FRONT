-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA PLAN
-- =====================================================
-- Este script crea las políticas RLS necesarias para que:
-- 1. Los superadmins puedan hacer CRUD completo
-- 2. Todos los usuarios autenticados puedan ver planes activos
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
DROP POLICY IF EXISTS "Superadmins pueden ver todos los planes" ON "PLAN";
DROP POLICY IF EXISTS "Superadmins pueden crear planes" ON "PLAN";
DROP POLICY IF EXISTS "Superadmins pueden actualizar planes" ON "PLAN";
DROP POLICY IF EXISTS "Superadmins pueden eliminar planes" ON "PLAN";
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver planes activos" ON "PLAN";

-- =====================================================
-- HABILITAR RLS EN LA TABLA PLAN
-- =====================================================
ALTER TABLE "PLAN" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICA 1: Superadmins pueden ver todos los planes
-- =====================================================
CREATE POLICY "Superadmins pueden ver todos los planes"
ON "PLAN"
FOR SELECT
TO authenticated
USING (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 2: Todos los usuarios autenticados pueden ver planes activos
-- =====================================================
CREATE POLICY "Usuarios autenticados pueden ver planes activos"
ON "PLAN"
FOR SELECT
TO authenticated
USING (
  "estadoPlan" = true
);

-- =====================================================
-- POLÍTICA 3: Superadmins pueden crear planes
-- =====================================================
CREATE POLICY "Superadmins pueden crear planes"
ON "PLAN"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 4: Superadmins pueden actualizar planes
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar planes"
ON "PLAN"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- POLÍTICA 5: Superadmins pueden eliminar planes (soft delete)
-- =====================================================
-- Nota: La eliminación es "soft delete" (cambia estadoPlan a false)
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
WHERE tablename = 'PLAN'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los superadmins tienen acceso completo (CRUD)
-- 2. Los usuarios normales solo pueden ver planes activos
-- 3. La eliminación es "soft delete" (cambia estadoPlan a false)
-- 4. La función is_superadmin usa SECURITY DEFINER para evitar recursión

