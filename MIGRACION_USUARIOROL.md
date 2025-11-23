# Migración a Tabla Intermedia USUARIOROL

## ¿Por qué usar USUARIOROL?

La tabla intermedia `USUARIOROL` es **muy conveniente** para tu proyecto SAAS porque:

1. **Flexibilidad**: Permite que un usuario tenga múltiples roles
2. **Escalabilidad**: Fácil agregar más roles en el futuro sin cambiar la estructura
3. **Auditoría**: Puedes agregar campos como `fechaAsignacion`, `asignadoPor`, etc.
4. **Mejor diseño**: Sigue el patrón de normalización de base de datos

## Cambios Realizados en el Código

### ✅ Servicios Actualizados

1. **`usuarioRolService.js`** (NUEVO)
   - `getRolesByUsuario()` - Obtiene todos los roles de un usuario
   - `asignarRolAUsuario()` - Asigna un rol a un usuario
   - `asignarRolesAUsuario()` - Asigna múltiples roles
   - `removerRolDeUsuario()` - Remueve un rol
   - `usuarioTieneRol()` - Verifica si un usuario tiene un rol específico

2. **`usuarioService.js`** (ACTUALIZADO)
   - Todas las consultas ahora usan `USUARIOROL` en lugar de `rolId` directo
   - Mantiene compatibilidad mostrando el primer rol como `rol` principal

3. **`authService.js`** (ACTUALIZADO)
   - `getUsuarioSistema()` ahora carga roles desde `USUARIOROL`
   - `esSuperAdmin()` verifica roles desde la tabla intermedia

### ✅ Componentes Actualizados

1. **`UsuarioForm.jsx`**
   - Carga roles existentes del usuario desde `USUARIOROL`
   - Permite seleccionar un rol (puedes extenderlo para múltiples roles)

2. **`UsuariosPage.jsx`**
   - Muestra todos los roles del usuario en la tabla
   - Asigna roles usando `asignarRolesAUsuario()` después de crear/actualizar

## Cambios Necesarios en Supabase

### Opción 1: Si ya tienes la columna `rolId` en USUARIO

```sql
-- 1. Crear la tabla USUARIOROL
CREATE TABLE USUARIOROL (
  idUsuario INTEGER NOT NULL REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
  idRol INTEGER NOT NULL REFERENCES ROL(idRol) ON DELETE CASCADE,
  estadoUsuarioRol BOOLEAN DEFAULT TRUE,
  fechaAsignacion TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (idUsuario, idRol)
);

-- 2. Migrar datos existentes de rolId a USUARIOROL
INSERT INTO USUARIOROL (idUsuario, idRol, estadoUsuarioRol)
SELECT 
  idUsuario,
  rolId,
  TRUE
FROM USUARIO
WHERE rolId IS NOT NULL
ON CONFLICT (idUsuario, idRol) DO NOTHING;

-- 3. (Opcional) Eliminar la columna rolId después de verificar que todo funciona
-- ALTER TABLE USUARIO DROP COLUMN rolId;
```

### Opción 2: Si NO tienes la columna `rolId` (tabla nueva)

```sql
-- Solo crear la tabla USUARIOROL
CREATE TABLE USUARIOROL (
  idUsuario INTEGER NOT NULL REFERENCES USUARIO(idUsuario) ON DELETE CASCADE,
  idRol INTEGER NOT NULL REFERENCES ROL(idRol) ON DELETE CASCADE,
  estadoUsuarioRol BOOLEAN DEFAULT TRUE,
  fechaAsignacion TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (idUsuario, idRol)
);

-- Crear índices
CREATE INDEX idx_usuariorol_usuario ON USUARIOROL(idUsuario);
CREATE INDEX idx_usuariorol_rol ON USUARIOROL(idRol);
CREATE INDEX idx_usuariorol_estado ON USUARIOROL(estadoUsuarioRol);
```

## Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en USUARIOROL
ALTER TABLE USUARIOROL ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios roles
CREATE POLICY "Usuarios pueden ver sus propios roles"
  ON USUARIOROL FOR SELECT
  TO authenticated
  USING (
    idUsuario IN (
      SELECT idUsuario FROM USUARIO
      WHERE authUserId = auth.uid()
      AND estadoUsuario = TRUE
    )
  );

-- Los usuarios pueden ver roles de usuarios de su organización
CREATE POLICY "Usuarios pueden ver roles de su organización"
  ON USUARIOROL FOR SELECT
  TO authenticated
  USING (
    idUsuario IN (
      SELECT u.idUsuario FROM USUARIO u
      INNER JOIN USUARIO u2 ON u.organizacionId = u2.organizacionId
      WHERE u2.authUserId = auth.uid()
      AND u.estadoUsuario = TRUE
      AND u2.estadoUsuario = TRUE
    )
  );

-- Solo superadmins pueden gestionar roles
CREATE POLICY "Superadmins pueden gestionar roles"
  ON USUARIOROL FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM USUARIO u
      INNER JOIN USUARIOROL ur ON u.idUsuario = ur.idUsuario
      INNER JOIN ROL r ON ur.idRol = r.idRol
      WHERE u.authUserId = auth.uid()
      AND u.estadoUsuario = TRUE
      AND ur.estadoUsuarioRol = TRUE
      AND (r.nombreRol = 'SUPERADMIN' OR r.idRol = 1)
    )
  );
```

## Verificar la Migración

```sql
-- Verificar que todos los usuarios tienen roles asignados
SELECT 
  u.idUsuario,
  u.email,
  u.nombreUsuario,
  COUNT(ur.idRol) as cantidad_roles
FROM USUARIO u
LEFT JOIN USUARIOROL ur ON u.idUsuario = ur.idUsuario AND ur.estadoUsuarioRol = TRUE
WHERE u.estadoUsuario = TRUE
GROUP BY u.idUsuario, u.email, u.nombreUsuario
ORDER BY cantidad_roles DESC;

-- Ver usuarios sin roles
SELECT u.*
FROM USUARIO u
LEFT JOIN USUARIOROL ur ON u.idUsuario = ur.idUsuario AND ur.estadoUsuarioRol = TRUE
WHERE u.estadoUsuario = TRUE
AND ur.idRol IS NULL;
```

## Ventajas de este Enfoque

1. **Múltiples Roles**: Un usuario puede tener varios roles simultáneamente
2. **Historial**: Puedes mantener un historial de cambios de roles
3. **Flexibilidad**: Fácil agregar campos adicionales (fecha, motivo, etc.)
4. **Normalización**: Sigue mejores prácticas de diseño de BD
5. **Escalabilidad**: Preparado para crecer sin cambios estructurales

## Notas Importantes

- El código mantiene compatibilidad mostrando el **primer rol activo** como `rol` principal
- Si necesitas que un usuario tenga múltiples roles, puedes extender `UsuarioForm` para permitir selección múltiple
- La función `esSuperAdmin()` verifica si el usuario tiene **cualquier** rol SUPERADMIN
- Todos los servicios están actualizados para usar `USUARIOROL` en lugar de `rolId` directo

