-- =====================================================
-- TRIGGER PARA CREAR USUARIO EN public.USUARIO
-- CUANDO SE CREA UN USUARIO EN auth.users
-- =====================================================

-- Función que se ejecutará cuando se cree un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id_usuario BIGINT;
  v_rol_id INTEGER;
BEGIN
  -- Desactivar RLS temporalmente para permitir la inserción
  PERFORM set_config('row_security', 'off', true);
  
  -- Insertar el nuevo usuario en la tabla USUARIO
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
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      SPLIT_PART(COALESCE(NEW.email, 'usuario'), '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'telefono', NULL),
    true,
    CASE 
      WHEN NEW.raw_user_meta_data->>'organizacionId' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'organizacionId')::UUID
      ELSE NULL
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT ("authUserId") DO NOTHING
  RETURNING "idUsuario" INTO v_id_usuario;
  
  -- Si no se obtuvo el idUsuario (porque ya existía), obtenerlo
  IF v_id_usuario IS NULL THEN
    SELECT "idUsuario" INTO v_id_usuario
    FROM public."USUARIO"
    WHERE "authUserId" = NEW.id
    LIMIT 1;
  END IF;
  
  -- Si se obtuvo el idUsuario y hay un rolId en los metadata, crear el registro en USUARIOROL
  IF v_id_usuario IS NOT NULL AND NEW.raw_user_meta_data->>'rolId' IS NOT NULL THEN
    BEGIN
      -- Convertir rolId a INTEGER
      v_rol_id := (NEW.raw_user_meta_data->>'rolId')::INTEGER;
      
      -- Insertar el registro en USUARIOROL si el rolId es válido
      IF v_rol_id > 0 THEN
        INSERT INTO public."USUARIOROL" (
          "idUsuario",
          "idRol",
          "estadoUsuarioRol"
        )
        VALUES (
          v_id_usuario,
          v_rol_id,
          true
        )
        ON CONFLICT ("idUsuario", "idRol") DO UPDATE SET
          "estadoUsuarioRol" = true;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Si hay error al crear el rol, solo registrar el warning pero no fallar
        RAISE WARNING 'Error al crear registro en USUARIOROL para usuario %: %', v_id_usuario, SQLERRM;
    END;
  END IF;
  
  -- Reactivar RLS
  PERFORM set_config('row_security', 'on', true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Reactivar RLS en caso de error
    PERFORM set_config('row_security', 'on', true);
    -- Registrar el error pero no fallar el trigger
    RAISE WARNING 'Error al crear usuario en public.USUARIO: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Eliminar el trigger si ya existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger que se ejecuta después de insertar un usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que el trigger se creó correctamente:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- 
-- Para verificar la función:
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

