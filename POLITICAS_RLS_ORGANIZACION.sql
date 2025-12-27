-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA ORGANIZACION
-- =====================================================
-- Objetivos:
-- 1. Solo el superadmin puede crear organizaciones.
-- 2. Los usuarios pueden ver su propia organización.
-- 3. Los superadmins pueden ver todas las organizaciones.
-- 4. Solo los superadmins pueden actualizar/eliminar organizaciones.
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

-- Helper: obtener idUsuario desde authUserId
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

-- Helper: verificar si el usuario autenticado pertenece a la organización
DROP FUNCTION IF EXISTS pertenece_a_organizacion(UUID, INTEGER);
DROP FUNCTION IF EXISTS pertenece_a_organizacion(UUID, BIGINT);
DROP FUNCTION IF EXISTS pertenece_a_organizacion(UUID, UUID);
CREATE OR REPLACE FUNCTION pertenece_a_organizacion(p_auth_user UUID, p_id_organizacion UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_org UUID;
BEGIN
  IF p_id_organizacion IS NULL THEN
    RETURN false;
  END IF;

  SELECT "organizacionId" INTO actor_org
  FROM "USUARIO"
  WHERE "authUserId" = p_auth_user
    AND "estadoUsuario" = true
  LIMIT 1;

  RETURN actor_org IS NOT NULL AND actor_org = p_id_organizacion;
END;
$$;

-- =====================================================
-- ELIMINAR POLÍTICAS PREVIAS
-- =====================================================
DROP POLICY IF EXISTS "Superadmins ven todas las organizaciones" ON "ORGANIZACION";
DROP POLICY IF EXISTS "Usuarios ven su propia organización" ON "ORGANIZACION";
DROP POLICY IF EXISTS "Superadmins pueden crear organizaciones" ON "ORGANIZACION";
DROP POLICY IF EXISTS "Superadmins pueden actualizar organizaciones" ON "ORGANIZACION";
DROP POLICY IF EXISTS "Superadmins pueden eliminar organizaciones" ON "ORGANIZACION";

ALTER TABLE "ORGANIZACION" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT
-- =====================================================
CREATE POLICY "Superadmins ven todas las organizaciones"
ON "ORGANIZACION"
FOR SELECT
TO authenticated
USING (is_superadmin(auth.uid()));

CREATE POLICY "Usuarios ven su propia organización"
ON "ORGANIZACION"
FOR SELECT
TO authenticated
USING (
  pertenece_a_organizacion(auth.uid(), "idOrganizacion")
);

-- =====================================================
-- INSERT
-- =====================================================
CREATE POLICY "Superadmins pueden crear organizaciones"
ON "ORGANIZACION"
FOR INSERT
TO authenticated
WITH CHECK (
  is_superadmin(auth.uid())
);

-- =====================================================
-- UPDATE
-- =====================================================
CREATE POLICY "Superadmins pueden actualizar organizaciones"
ON "ORGANIZACION"
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
WHERE tablename = 'ORGANIZACION'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Solo los superadmins pueden crear organizaciones.
-- 2. Los usuarios pueden ver su propia organización.
-- 3. Los superadmins pueden ver todas las organizaciones.
-- 4. Solo los superadmins pueden actualizar/eliminar organizaciones.
-- 5. La eliminación es "soft delete" (cambia estadoOrganizacion a false).
-- =====================================================

