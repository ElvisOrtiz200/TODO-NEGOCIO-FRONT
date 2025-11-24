-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA ROL
-- =====================================================
-- Objetivos:
-- 1. Solo el superadmin puede crear roles.
-- 2. Todos los usuarios autenticados pueden ver roles (para asignarlos).
-- 3. Solo los superadmins pueden actualizar/eliminar roles.
-- =====================================================

-- Helper: ¿es superadmin? (reutilizar si ya existe, si no crearla)
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
  SELECT "idUsuario" INTO id_usuario
  FROM "USUARIO"
  WHERE "authUserId" = user_id
    AND "estadoUsuario" = true
  LIMIT 1;

  IF id_usuario IS NULL THEN
    RETURN false;
  END IF;

  PERFORM set_config('row_security', 'off', true);

  SELECT EXISTS(
    SELECT 1
    FROM "USUARIOROL" ur
    INNER JOIN "ROL" r ON ur."idRol" = r."idRol"
    WHERE ur."idUsuario" = id_usuario
      AND ur."estadoUsuarioRol" = true
      AND r."estadoRol" = true
      AND (UPPER(r."nombreRol") = 'SUPERADMIN' OR r."idRol" = 1)
  ) INTO es_admin;

  PERFORM set_config('row_security', 'on', true);

  RETURN es_admin;
END;
$$;

-- =====================================================
-- ELIMINAR POLÍTICAS PREVIAS
-- =====================================================
DROP POLICY IF EXISTS "Todos pueden ver roles" ON "ROL";
DROP POLICY IF EXISTS "Superadmins pueden crear roles" ON "ROL";
DROP POLICY IF EXISTS "Superadmins pueden actualizar roles" ON "ROL";
DROP POLICY IF EXISTS "Superadmins pueden eliminar roles" ON "ROL";

ALTER TABLE "ROL" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT
-- =====================================================
-- Todos los usuarios autenticados pueden ver roles (para poder asignarlos)
CREATE POLICY "Todos pueden ver roles"
ON "ROL"
FOR SELECT
TO authenticated
USING ("estadoRol" = true);

-- =====================================================
-- INSERT
-- =====================================================
CREATE POLICY "Superadmins pueden crear roles"
ON "ROL"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- UPDATE
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar roles"
ON "ROL"
FOR UPDATE
TO authenticated
USING (
  is_superadmin(auth.uid())
)
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- DELETE (soft delete) -> se cubre con las políticas de UPDATE
-- =====================================================

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
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
WHERE tablename = 'ROL'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Solo los superadmins pueden crear roles.
-- 2. Todos los usuarios autenticados pueden ver roles activos (necesario para asignarlos).
-- 3. Solo los superadmins pueden actualizar/eliminar roles.
-- 4. La eliminación es "soft delete" (cambia estadoRol a false).
-- =====================================================

