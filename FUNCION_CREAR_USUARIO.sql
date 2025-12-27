-- =====================================================
-- FUNCIÓN PARA CREAR USUARIO EN public.USUARIO
-- Evita problemas con políticas RLS al insertar
-- =====================================================

CREATE OR REPLACE FUNCTION public.crear_usuario_sistema(
  p_auth_user_id UUID,
  p_email VARCHAR,
  p_nombre VARCHAR,
  p_telefono VARCHAR DEFAULT NULL,
  p_organizacion_id UUID DEFAULT NULL
)
RETURNS TABLE(
  "idUsuario" BIGINT,
  "authUserId" UUID,
  "emailUsuario" VARCHAR,
  "nombreUsuario" VARCHAR,
  "telefonoUsuario" VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id_usuario BIGINT;
BEGIN
  -- Desactivar RLS temporalmente
  PERFORM set_config('row_security', 'off', true);
  
  -- Verificar si el usuario ya existe antes de insertar
  SELECT u."idUsuario" INTO v_id_usuario
  FROM public."USUARIO" u
  WHERE u."authUserId" = p_auth_user_id
  LIMIT 1;
  
  -- Si el usuario ya existe, lanzar un error
  IF v_id_usuario IS NOT NULL THEN
    PERFORM set_config('row_security', 'on', true);
    RAISE EXCEPTION 'El usuario con authUserId % ya existe en el sistema', p_auth_user_id
      USING ERRCODE = '23505', HINT = 'El usuario ya está registrado. Use la opción de buscar usuario existente.';
  END IF;
  
  -- Insertar el nuevo usuario
  INSERT INTO public."USUARIO" (
    "authUserId",
    "emailUsuario",
    "nombreUsuario",
    "telefonoUsuario",
    "estadoUsuario",
    "organizacionId",
    "fechaCreacion",
    "fechaActualizacion"
  )
  VALUES (
    p_auth_user_id,
    p_email,
    p_nombre,
    p_telefono,
    true,
    p_organizacion_id,
    NOW(),
    NOW()
  );
  
  -- Obtener el ID del usuario recién insertado
  SELECT u."idUsuario" INTO v_id_usuario
  FROM public."USUARIO" u
  WHERE u."authUserId" = p_auth_user_id;
  
  -- Obtener el ID del usuario (ya sea insertado o actualizado)
  SELECT u."idUsuario" INTO v_id_usuario
  FROM public."USUARIO" u
  WHERE u."authUserId" = p_auth_user_id;
  
  -- Reactivar RLS
  PERFORM set_config('row_security', 'on', true);
  
  -- Retornar el usuario creado/actualizado
  RETURN QUERY
  SELECT 
    u."idUsuario",
    u."authUserId",
    u."emailUsuario",
    u."nombreUsuario",
    u."telefonoUsuario"
  FROM public."USUARIO" u
  WHERE u."idUsuario" = v_id_usuario;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Reactivar RLS en caso de error
    PERFORM set_config('row_security', 'on', true);
    RAISE;
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.crear_usuario_sistema(UUID, VARCHAR, VARCHAR, VARCHAR, UUID) TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que la función se creó correctamente:
-- SELECT * FROM pg_proc WHERE proname = 'crear_usuario_sistema';

