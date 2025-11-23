-- ============================================
-- CREAR ROLES Y PERMISOS INICIALES
-- ============================================
-- Este script crea los roles y permisos básicos del sistema
-- Ejecutar después de crear las tablas ROL y PERMISO

-- ============================================
-- 1. CREAR ROLES DEL SISTEMA
-- ============================================

-- SUPERADMIN (ya debería existir, pero por si acaso)
INSERT INTO "ROL" ("nombreRol", "descripcionRol", "estadoRol", "fechaRegistroRol")
VALUES 
  ('SUPERADMIN', 'Administrador del sistema completo. Gestiona todas las organizaciones.', TRUE, NOW())
ON CONFLICT ("nombreRol") DO NOTHING;

-- Roles de Organización
INSERT INTO "ROL" ("nombreRol", "descripcionRol", "estadoRol", "fechaRegistroRol")
VALUES 
  ('VENDEDOR', 'Personal de ventas. Puede crear ventas y gestionar clientes.', TRUE, NOW()),
  ('ALMACENERO', 'Encargado de inventario y almacén. Gestiona stock y movimientos.', TRUE, NOW()),
  ('COMPRADOR', 'Encargado de compras y proveedores. Gestiona compras y relaciones con proveedores.', TRUE, NOW()),
  ('CONTADOR', 'Personal de finanzas. Solo lectura para revisar reportes y contabilidad.', TRUE, NOW()),
  ('CAJERO', 'Personal de punto de venta. Puede crear ventas rápidas.', TRUE, NOW()),
  ('VISUALIZADOR', 'Solo lectura en todo el sistema. Para gerentes y auditores.', TRUE, NOW())
ON CONFLICT ("nombreRol") DO NOTHING;

-- ============================================
-- 2. CREAR PERMISOS
-- ============================================

-- Permisos de Productos
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('productos.ver', TRUE),
  ('productos.crear', TRUE),
  ('productos.editar', TRUE),
  ('productos.eliminar', TRUE),
  ('productos.ver_precio_costo', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Categorías
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('categorias.ver', TRUE),
  ('categorias.crear', TRUE),
  ('categorias.editar', TRUE),
  ('categorias.eliminar', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Ventas
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('ventas.ver', TRUE),
  ('ventas.crear', TRUE),
  ('ventas.editar', TRUE),
  ('ventas.anular', TRUE),
  ('ventas.ver_todas', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Compras
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('compras.ver', TRUE),
  ('compras.crear', TRUE),
  ('compras.editar', TRUE),
  ('compras.anular', TRUE),
  ('compras.ver_todas', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Inventario
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('inventario.ver', TRUE),
  ('inventario.ajustar', TRUE),
  ('inventario.ver_movimientos', TRUE),
  ('inventario.crear_movimientos', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Clientes
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('clientes.ver', TRUE),
  ('clientes.crear', TRUE),
  ('clientes.editar', TRUE),
  ('clientes.eliminar', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Proveedores
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('proveedores.ver', TRUE),
  ('proveedores.crear', TRUE),
  ('proveedores.editar', TRUE),
  ('proveedores.eliminar', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Almacenes
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('almacenes.ver', TRUE),
  ('almacenes.crear', TRUE),
  ('almacenes.editar', TRUE),
  ('almacenes.eliminar', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Reportes
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('reportes.ver', TRUE),
  ('reportes.exportar', TRUE),
  ('reportes.ver_financieros', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Usuarios (Organización)
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('usuarios.ver', TRUE),
  ('usuarios.crear', TRUE),
  ('usuarios.editar', TRUE),
  ('usuarios.eliminar', TRUE),
  ('usuarios.asignar_roles', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- Permisos de Configuración
INSERT INTO "PERMISO" ("nombrePermiso", "estadoPermiso")
VALUES 
  ('configuracion.ver', TRUE),
  ('configuracion.editar', TRUE)
ON CONFLICT ("nombrePermiso") DO NOTHING;

-- ============================================
-- 3. ASIGNAR PERMISOS A ROLES
-- ============================================

-- Función helper para asignar permisos a un rol
CREATE OR REPLACE FUNCTION asignar_permisos_a_rol(
  p_nombre_rol TEXT,
  p_permisos TEXT[]
)
RETURNS VOID AS $$
DECLARE
  v_id_rol INTEGER;
  v_id_permiso INTEGER;
  v_permiso TEXT;
BEGIN
  -- Obtener ID del rol
  SELECT "idRol" INTO v_id_rol
  FROM "ROL"
  WHERE "nombreRol" = p_nombre_rol
  LIMIT 1;
  
  IF v_id_rol IS NULL THEN
    RAISE EXCEPTION 'Rol % no encontrado', p_nombre_rol;
  END IF;
  
  -- Asignar cada permiso
  FOREACH v_permiso IN ARRAY p_permisos
  LOOP
    SELECT "idPermiso" INTO v_id_permiso
    FROM "PERMISO"
    WHERE "nombrePermiso" = v_permiso
    LIMIT 1;
    
    IF v_id_permiso IS NOT NULL THEN
      INSERT INTO "ROLPERMISO" ("idRol", "idPermiso", "estadoRolPermiso")
      VALUES (v_id_rol, v_id_permiso, TRUE)
      ON CONFLICT ("idRol", "idPermiso") DO UPDATE
      SET "estadoRolPermiso" = TRUE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ADMINISTRADOR: Todos los permisos (excepto superadmin)
SELECT asignar_permisos_a_rol('ADMINISTRADOR', ARRAY[
  'productos.ver', 'productos.crear', 'productos.editar', 'productos.eliminar', 'productos.ver_precio_costo',
  'categorias.ver', 'categorias.crear', 'categorias.editar', 'categorias.eliminar',
  'ventas.ver', 'ventas.crear', 'ventas.editar', 'ventas.anular', 'ventas.ver_todas',
  'compras.ver', 'compras.crear', 'compras.editar', 'compras.anular', 'compras.ver_todas',
  'inventario.ver', 'inventario.ajustar', 'inventario.ver_movimientos', 'inventario.crear_movimientos',
  'clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.eliminar',
  'proveedores.ver', 'proveedores.crear', 'proveedores.editar', 'proveedores.eliminar',
  'almacenes.ver', 'almacenes.crear', 'almacenes.editar', 'almacenes.eliminar',
  'reportes.ver', 'reportes.exportar', 'reportes.ver_financieros',
  'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar', 'usuarios.asignar_roles',
  'configuracion.ver', 'configuracion.editar'
]);

-- VENDEDOR: Permisos de ventas y clientes
SELECT asignar_permisos_a_rol('VENDEDOR', ARRAY[
  'productos.ver',
  'categorias.ver',
  'ventas.ver', 'ventas.crear', 'ventas.editar', 'ventas.ver_todas',
  'clientes.ver', 'clientes.crear', 'clientes.editar',
  'inventario.ver',
  'reportes.ver'
]);

-- ALMACENERO: Permisos de inventario
SELECT asignar_permisos_a_rol('ALMACENERO', ARRAY[
  'productos.ver',
  'categorias.ver',
  'inventario.ver', 'inventario.ajustar', 'inventario.ver_movimientos', 'inventario.crear_movimientos',
  'almacenes.ver',
  'compras.ver',
  'reportes.ver'
]);

-- COMPRADOR: Permisos de compras
SELECT asignar_permisos_a_rol('COMPRADOR', ARRAY[
  'productos.ver',
  'compras.ver', 'compras.crear', 'compras.editar', 'compras.ver_todas',
  'proveedores.ver', 'proveedores.crear', 'proveedores.editar',
  'inventario.ver',
  'reportes.ver'
]);

-- CONTADOR: Solo lectura
SELECT asignar_permisos_a_rol('CONTADOR', ARRAY[
  'productos.ver',
  'categorias.ver',
  'ventas.ver', 'ventas.ver_todas',
  'compras.ver', 'compras.ver_todas',
  'clientes.ver',
  'proveedores.ver',
  'inventario.ver', 'inventario.ver_movimientos',
  'reportes.ver', 'reportes.exportar', 'reportes.ver_financieros'
]);

-- CAJERO: Ventas básicas
SELECT asignar_permisos_a_rol('CAJERO', ARRAY[
  'productos.ver',
  'ventas.crear', 'ventas.ver',
  'clientes.ver',
  'inventario.ver'
]);

-- VISUALIZADOR: Solo lectura en todo
SELECT asignar_permisos_a_rol('VISUALIZADOR', ARRAY[
  'productos.ver',
  'categorias.ver',
  'ventas.ver', 'ventas.ver_todas',
  'compras.ver', 'compras.ver_todas',
  'clientes.ver',
  'proveedores.ver',
  'almacenes.ver',
  'inventario.ver', 'inventario.ver_movimientos',
  'reportes.ver'
]);

-- ============================================
-- 4. VERIFICAR ASIGNACIONES
-- ============================================

-- Ver roles creados
SELECT "idRol", "nombreRol", "descripcionRol"
FROM "ROL"
WHERE "estadoRol" = TRUE
ORDER BY "idRol";

-- Ver permisos por rol
SELECT 
  r."nombreRol",
  COUNT(rp."idPermiso") as total_permisos
FROM "ROL" r
LEFT JOIN "ROL_PERMISO" rp ON r."idRol" = rp."idRol" AND rp."estadoRolPermiso" = TRUE
WHERE r."estadoRol" = TRUE
GROUP BY r."idRol", r."nombreRol"
ORDER BY r."idRol";

-- Ver detalle de permisos de un rol específico
SELECT 
  r."nombreRol",
  p."nombrePermiso",
  p."descripcionPermiso"
FROM "ROL" r
INNER JOIN "ROL_PERMISO" rp ON r."idRol" = rp."idRol"
INNER JOIN "PERMISO" p ON rp."idPermiso" = p."idPermiso"
WHERE r."nombreRol" = 'ADMINISTRADOR'
AND rp."estadoRolPermiso" = TRUE
AND p."estadoPermiso" = TRUE
ORDER BY p."nombrePermiso";

-- ============================================
-- NOTAS:
-- ============================================
-- 1. Este script crea los roles y permisos básicos
-- 2. Puedes personalizar los permisos según tus necesidades
-- 3. Los permisos se asignan desde la interfaz web en /home/roles-admin
-- 4. Un usuario puede tener múltiples roles
-- ============================================

