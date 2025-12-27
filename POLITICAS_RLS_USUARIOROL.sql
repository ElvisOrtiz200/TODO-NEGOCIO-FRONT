-- =====================================================
-- POLÍTICAS RLS PARA LA TABLA USUARIOROL
-- =====================================================
-- 1. Los administradores de cada organización gestionan
--    a sus usuarios y roles de manera autónoma.
-- 2. El superadmin solo interviene si aún no existe un
--    administrador o si éste otorgó autorización previa.
-- 3. Se mantiene la visibilidad de roles entre usuarios
--    de una misma organización para auditoría interna.
-- =====================================================

-- Función helper para verificar si un usuario es superadmin
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
  SELECT "idUsuario"
    INTO user_id
    FROM "USUARIO"
    WHERE "authUserId" = auth_user_id
      AND "estadoUsuario" = true;

  RETURN user_id; -- si no encuentra regresará NULL automáticamente
END;
$$;


-- Helper: organización a partir del idUsuario (acepta BIGINT para columnas serial/bigserial)
DROP FUNCTION IF EXISTS get_organizacion_id_from_usuario(BIGINT);
CREATE OR REPLACE FUNCTION get_organizacion_id_from_usuario(p_id_usuario BIGINT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT "organizacionId" INTO org_id
  FROM "USUARIO"
  WHERE "idUsuario" = p_id_usuario::INTEGER;

  RETURN org_id;
END;
$$;

-- Helper: saber si una organización ya tiene Administrador activo
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

-- Helper: validar si el usuario autenticado es Administrador de su organización
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

-- Helper: definir si el superadmin está autorizado a intervenir
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

-- =====================================================
-- LIMPIEZA DE POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Superadmins pueden ver todas las relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Superadmins pueden crear relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Superadmins pueden actualizar relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios roles" ON "USUARIOROL";
DROP POLICY IF EXISTS "Usuarios pueden ver roles de su organización" ON "USUARIOROL";
DROP POLICY IF EXISTS "Administradores pueden crear relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Administradores pueden actualizar relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Superadmins autorizados pueden crear relaciones usuario-rol" ON "USUARIOROL";
DROP POLICY IF EXISTS "Superadmins autorizados pueden actualizar relaciones usuario-rol" ON "USUARIOROL";

ALTER TABLE "USUARIOROL" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VISUALIZACIÓN DE ROLES
-- =====================================================
CREATE POLICY "Superadmins pueden ver todas las relaciones usuario-rol"
ON "USUARIOROL"
FOR SELECT
TO authenticated
USING (is_superadmin(auth.uid()));

CREATE POLICY "Usuarios pueden ver sus propios roles"
ON "USUARIOROL"
FOR SELECT
TO authenticated
USING ("idUsuario" = get_user_id_from_auth(auth.uid()));

CREATE POLICY "Usuarios pueden ver roles de su organización"
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
-- CRUD PARA ADMINISTRADORES DE LA ORGANIZACIÓN
-- =====================================================
CREATE POLICY "Administradores pueden crear relaciones usuario-rol"
ON "USUARIOROL"
FOR INSERT
TO authenticated
WITH CHECK (
  es_admin_organizacion(
    auth.uid(),
    get_organizacion_id_from_usuario("idUsuario")
  )
);

CREATE POLICY "Administradores pueden actualizar relaciones usuario-rol"
ON "USUARIOROL"
FOR UPDATE
TO authenticated
USING (
  es_admin_organizacion(
    auth.uid(),
    get_organizacion_id_from_usuario("idUsuario")
  )
)
WITH CHECK (
  es_admin_organizacion(
    auth.uid(),
    get_organizacion_id_from_usuario("idUsuario")
  )
);

-- =====================================================
-- CRUD PARA SUPERADMIN CON AUTORIZACIÓN EXPLÍCITA
-- =====================================================
CREATE POLICY "Superadmins autorizados pueden crear relaciones usuario-rol"
ON "USUARIOROL"
FOR INSERT
TO authenticated
WITH CHECK (
  superadmin_autorizado_para_organizacion(
    auth.uid(),
    get_organizacion_id_from_usuario("idUsuario")
  )
);

CREATE POLICY "Superadmins autorizados pueden actualizar relaciones usuario-rol"
ON "USUARIOROL"
FOR UPDATE
TO authenticated
USING (
  superadmin_autorizado_para_organizacion(
    auth.uid(),
    get_organizacion_id_from_usuario("idUsuario")
  )
)
WITH CHECK (
  superadmin_autorizado_para_organizacion(
    auth.uid(),
    get_organizacion_id_from_usuario("idUsuario")
  )
);

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
WHERE tablename = 'USUARIOROL'
ORDER BY policyname;

-- =====================================================
-- NOTAS
-- =====================================================
-- 1. Los administradores tienen control total de sus usuarios.
-- 2. El superadmin requiere autorización explícita cuando ya existe un administrador.
-- 3. Las funciones usan SECURITY DEFINER para evitar problemas con RLS.
*** End Patch

