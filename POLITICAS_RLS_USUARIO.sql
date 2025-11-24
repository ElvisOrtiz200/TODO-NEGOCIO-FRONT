-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA USUARIO
-- =====================================================
-- Objetivos:
-- 1. Los administradores de cada organización gestionan a sus propios usuarios.
-- 2. El superadmin solo interviene si aún no existe administrador o si tiene autorización explícita.
-- 3. Cada usuario autenticado puede ver su propio registro.
-- =====================================================

DROP FUNCTION IF EXISTS is_superadmin(UUID);
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

DROP FUNCTION IF EXISTS get_user_id_from_auth(UUID);
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

DROP FUNCTION IF EXISTS organizacion_tiene_administrador(UUID);
DROP FUNCTION IF EXISTS organizacion_tiene_administrador(BIGINT);
DROP FUNCTION IF EXISTS organizacion_tiene_administrador(INTEGER);
CREATE OR REPLACE FUNCTION organizacion_tiene_administrador(p_id_organizacion UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existe_admin BOOLEAN := false;
BEGIN
  IF p_id_organizacion IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM "USUARIO" u
    INNER JOIN "USUARIOROL" ur ON ur."idUsuario" = u."idUsuario"
    INNER JOIN "ROL" r ON r."idRol" = ur."idRol"
    WHERE u."organizacionId" = p_id_organizacion
      AND u."estadoUsuario" = true
      AND ur."estadoUsuarioRol" = true
      AND r."estadoRol" = true
      AND UPPER(r."nombreRol") = 'ADMINISTRADOR'
  ) INTO existe_admin;

  RETURN existe_admin;
END;
$$;

DROP FUNCTION IF EXISTS es_admin_organizacion(UUID, UUID);
DROP FUNCTION IF EXISTS es_admin_organizacion(UUID, BIGINT);
DROP FUNCTION IF EXISTS es_admin_organizacion(UUID, INTEGER);
CREATE OR REPLACE FUNCTION es_admin_organizacion(p_auth_user UUID, p_id_organizacion UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id INTEGER;
  actor_org UUID;
  es_admin BOOLEAN := false;
BEGIN
  IF p_id_organizacion IS NULL THEN
    RETURN false;
  END IF;

  SELECT "idUsuario", "organizacionId"
    INTO actor_id, actor_org
  FROM "USUARIO"
  WHERE "authUserId" = p_auth_user
    AND "estadoUsuario" = true
  LIMIT 1;

  IF actor_id IS NULL OR actor_org IS NULL OR actor_org <> p_id_organizacion THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM "USUARIOROL" ur
    INNER JOIN "ROL" r ON r."idRol" = ur."idRol"
    WHERE ur."idUsuario" = actor_id
      AND ur."estadoUsuarioRol" = true
      AND r."estadoRol" = true
      AND UPPER(r."nombreRol") = 'ADMINISTRADOR'
  ) INTO es_admin;

  RETURN es_admin;
END;
$$;

DROP FUNCTION IF EXISTS superadmin_autorizado_para_organizacion(UUID, UUID);
DROP FUNCTION IF EXISTS superadmin_autorizado_para_organizacion(UUID, BIGINT);
DROP FUNCTION IF EXISTS superadmin_autorizado_para_organizacion(UUID, INTEGER);
CREATE OR REPLACE FUNCTION superadmin_autorizado_para_organizacion(p_auth_user UUID, p_id_organizacion UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tiene_admin BOOLEAN := false;
  autorizado BOOLEAN := false;
BEGIN
  IF p_id_organizacion IS NULL THEN
    RETURN is_superadmin(p_auth_user);
  END IF;

  SELECT organizacion_tiene_administrador(p_id_organizacion) INTO tiene_admin;

  IF NOT tiene_admin THEN
    RETURN is_superadmin(p_auth_user);
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM "ORGANIZACION"
    WHERE "idOrganizacion" = p_id_organizacion
      AND "autorizaSuperadminUsuarios" = true
  ) INTO autorizado;

  RETURN autorizado AND is_superadmin(p_auth_user);
END;
$$;

DROP FUNCTION IF EXISTS pertenece_a_organizacion(UUID, UUID);
DROP FUNCTION IF EXISTS pertenece_a_organizacion(UUID, BIGINT);
DROP FUNCTION IF EXISTS pertenece_a_organizacion(UUID, INTEGER);
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
DROP POLICY IF EXISTS "Superadmins ven todos los usuarios" ON "USUARIO";
DROP POLICY IF EXISTS "Usuarios se ven a sí mismos" ON "USUARIO";
DROP POLICY IF EXISTS "Usuarios ven miembros de su organización" ON "USUARIO";
DROP POLICY IF EXISTS "Admins pueden crear usuarios" ON "USUARIO";
DROP POLICY IF EXISTS "Superadmins autorizados pueden crear usuarios" ON "USUARIO";
DROP POLICY IF EXISTS "Admins pueden actualizar usuarios" ON "USUARIO";
DROP POLICY IF EXISTS "Superadmins autorizados pueden actualizar usuarios" ON "USUARIO";

ALTER TABLE "USUARIO" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT
-- =====================================================
CREATE POLICY "Superadmins ven todos los usuarios"
ON "USUARIO"
FOR SELECT
TO authenticated
USING (is_superadmin(auth.uid()));

CREATE POLICY "Usuarios se ven a sí mismos"
ON "USUARIO"
FOR SELECT
TO authenticated
USING ("idUsuario" = get_user_id_from_auth(auth.uid()));

CREATE POLICY "Usuarios ven miembros de su organización"
ON "USUARIO"
FOR SELECT
TO authenticated
USING (
  pertenece_a_organizacion(auth.uid(), "organizacionId")
);

-- =====================================================
-- INSERT
-- =====================================================
CREATE POLICY "Admins pueden crear usuarios"
ON "USUARIO"
FOR INSERT
TO authenticated
WITH CHECK (
  es_admin_organizacion(auth.uid(), "organizacionId")
);

CREATE POLICY "Superadmins autorizados pueden crear usuarios"
ON "USUARIO"
FOR INSERT
TO authenticated
WITH CHECK (
  superadmin_autorizado_para_organizacion(auth.uid(), "organizacionId")
);

-- =====================================================
-- UPDATE
-- =====================================================
CREATE POLICY "Admins pueden actualizar usuarios"
ON "USUARIO"
FOR UPDATE
TO authenticated
USING (
  es_admin_organizacion(auth.uid(), "organizacionId")
)
WITH CHECK (
  es_admin_organizacion(auth.uid(), "organizacionId")
);

CREATE POLICY "Superadmins autorizados pueden actualizar usuarios"
ON "USUARIO"
FOR UPDATE
TO authenticated
USING (
  superadmin_autorizado_para_organizacion(auth.uid(), "organizacionId")
)
WITH CHECK (
  superadmin_autorizado_para_organizacion(auth.uid(), "organizacionId")
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
WHERE tablename = 'USUARIO'
ORDER BY policyname;

