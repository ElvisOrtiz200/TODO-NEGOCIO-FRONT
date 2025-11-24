# Estructura de Roles y Permisos para Sistema SAAS Multi-Tenant

## 🎯 Roles del Sistema

### 1. **SUPERADMIN** (Nivel Sistema)
**Descripción:** Administrador del sistema completo, gestiona todas las organizaciones.

**Permisos:**
- ✅ Crear, editar, eliminar organizaciones
- ✅ Asignar usuarios a organizaciones
- ✅ Gestionar planes de suscripción
- ✅ Gestionar roles del sistema
- ✅ Gestionar permisos
- ✅ Ver todas las organizaciones y usuarios
- ✅ Acceso a reportes globales
- ✅ Configuración del sistema

**Cuándo usar:** Solo para administradores del SAAS (no clientes)

---

## 🏢 Roles de Organización

### 2. **ADMINISTRADOR** (Nivel Organización)
**Descripción:** Administrador completo de su organización, tiene control total sobre los datos de su empresa.

**Permisos:**
- ✅ Gestionar usuarios de su organización
- ✅ Asignar roles a usuarios de su organización
- ✅ Ver y editar configuración de la organización
- ✅ **Productos:** Crear, editar, eliminar, ver todos
- ✅ **Categorías:** Crear, editar, eliminar, ver todos
- ✅ **Almacenes:** Crear, editar, eliminar, ver todos
- ✅ **Clientes:** Crear, editar, eliminar, ver todos
- ✅ **Proveedores:** Crear, editar, eliminar, ver todos
- ✅ **Ventas:** Crear, editar, anular, ver todas
- ✅ **Compras:** Crear, editar, anular, ver todas
- ✅ **Inventario:** Ver todo, ajustar stock, ver movimientos
- ✅ **Movimientos de Inventario:** Crear, editar, eliminar, ver todos
- ✅ **Tipo Movimientos:** Crear, editar, eliminar, ver todos
- ✅ **Reportes:** Ver todos los reportes
- ✅ **Dashboard:** Ver dashboard completo

**Cuándo usar:** Dueño de la empresa o gerente general

---

### 3. **VENDEDOR**
**Descripción:** Encargado de realizar ventas y gestionar clientes.

**Permisos:**
- ✅ **Ventas:** Crear, editar (propias), ver todas
- ✅ **Clientes:** Crear, editar, ver todos
- ✅ **Productos:** Ver todos (solo lectura)
- ✅ **Inventario:** Ver stock disponible (solo lectura)
- ✅ **Categorías:** Ver todas (solo lectura)
- ✅ **Reportes:** Ver reportes de ventas
- ✅ **Dashboard:** Ver dashboard de ventas

**Restricciones:**
- ❌ No puede anular ventas (solo admin)
- ❌ No puede modificar precios (solo ver)
- ❌ No puede gestionar inventario
- ❌ No puede ver compras

**Cuándo usar:** Personal de ventas, cajeros

---

### 4. **ALMACENERO**
**Descripción:** Encargado de gestionar inventario y almacenes.

**Permisos:**
- ✅ **Inventario:** Ver todo, ajustar stock
- ✅ **Movimientos de Inventario:** Crear, editar, ver todos
- ✅ **Almacenes:** Ver todos (solo lectura)
- ✅ **Productos:** Ver todos (solo lectura)
- ✅ **Compras:** Ver todas (solo lectura)
- ✅ **Tipo Movimientos:** Ver todos (solo lectura)
- ✅ **Reportes:** Ver reportes de inventario

**Restricciones:**
- ❌ No puede crear ventas
- ❌ No puede modificar productos
- ❌ No puede gestionar clientes
- ❌ No puede crear compras

**Cuándo usar:** Personal de almacén, bodegueros

---

### 5. **COMPRADOR**
**Descripción:** Encargado de gestionar compras y proveedores.

**Permisos:**
- ✅ **Compras:** Crear, editar, ver todas
- ✅ **Proveedores:** Crear, editar, ver todos
- ✅ **Productos:** Ver todos (solo lectura)
- ✅ **Inventario:** Ver stock (solo lectura)
- ✅ **Reportes:** Ver reportes de compras
- ✅ **Dashboard:** Ver dashboard de compras

**Restricciones:**
- ❌ No puede crear ventas
- ❌ No puede modificar inventario directamente
- ❌ No puede gestionar clientes
- ❌ No puede anular compras (solo admin)

**Cuándo usar:** Personal de compras, encargados de proveedores

---

### 6. **CONTADOR / FINANZAS**
**Descripción:** Encargado de revisar reportes financieros y contabilidad.

**Permisos:**
- ✅ **Ventas:** Ver todas (solo lectura)
- ✅ **Compras:** Ver todas (solo lectura)
- ✅ **Clientes:** Ver todos (solo lectura)
- ✅ **Proveedores:** Ver todos (solo lectura)
- ✅ **Productos:** Ver todos (solo lectura)
- ✅ **Reportes:** Ver todos los reportes
- ✅ **Dashboard:** Ver dashboard completo

**Restricciones:**
- ❌ No puede crear ni modificar registros
- ❌ Solo lectura en todos los módulos
- ❌ No puede gestionar usuarios

**Cuándo usar:** Contadores, personal de finanzas

---

### 7. **CAJERO**
**Descripción:** Personal de punto de venta, puede realizar ventas rápidas.

**Permisos:**
- ✅ **Ventas:** Crear, ver propias
- ✅ **Clientes:** Ver todos (solo lectura)
- ✅ **Productos:** Ver todos (solo lectura)
- ✅ **Inventario:** Ver stock disponible (solo lectura)

**Restricciones:**
- ❌ No puede editar ventas después de creadas
- ❌ No puede anular ventas
- ❌ No puede crear clientes
- ❌ No puede ver reportes

**Cuándo usar:** Personal de caja, vendedores de punto de venta

---

### 8. **VISUALIZADOR / CONSULTA**
**Descripción:** Solo puede ver información, sin modificar nada.

**Permisos:**
- ✅ **Todos los módulos:** Ver (solo lectura)
- ✅ **Dashboard:** Ver dashboard
- ✅ **Reportes:** Ver reportes

**Restricciones:**
- ❌ No puede crear, editar ni eliminar nada
- ❌ Solo lectura en todo el sistema

**Cuándo usar:** Gerentes que solo necesitan ver información, auditores

---

## 📋 Permisos Detallados por Módulo

### Módulo: PRODUCTOS
- `productos.ver` - Ver productos
- `productos.crear` - Crear productos
- `productos.editar` - Editar productos
- `productos.eliminar` - Eliminar productos
- `productos.ver_precio_costo` - Ver precio de costo (solo admin)

### Módulo: CATEGORÍAS
- `categorias.ver` - Ver categorías
- `categorias.crear` - Crear categorías
- `categorias.editar` - Editar categorías
- `categorias.eliminar` - Eliminar categorías

### Módulo: VENTAS
- `ventas.ver` - Ver ventas
- `ventas.crear` - Crear ventas
- `ventas.editar` - Editar ventas (propias o todas)
- `ventas.anular` - Anular ventas
- `ventas.ver_todas` - Ver todas las ventas (no solo propias)

### Módulo: COMPRAS
- `compras.ver` - Ver compras
- `compras.crear` - Crear compras
- `compras.editar` - Editar compras
- `compras.anular` - Anular compras
- `compras.ver_todas` - Ver todas las compras

### Módulo: INVENTARIO
- `inventario.ver` - Ver inventario
- `inventario.ajustar` - Ajustar stock
- `inventario.ver_movimientos` - Ver movimientos de inventario
- `inventario.crear_movimientos` - Crear movimientos

### Módulo: CLIENTES
- `clientes.ver` - Ver clientes
- `clientes.crear` - Crear clientes
- `clientes.editar` - Editar clientes
- `clientes.eliminar` - Eliminar clientes

### Módulo: PROVEEDORES
- `proveedores.ver` - Ver proveedores
- `proveedores.crear` - Crear proveedores
- `proveedores.editar` - Editar proveedores
- `proveedores.eliminar` - Eliminar proveedores

### Módulo: ALMACENES
- `almacenes.ver` - Ver almacenes
- `almacenes.crear` - Crear almacenes
- `almacenes.editar` - Editar almacenes
- `almacenes.eliminar` - Eliminar almacenes

### Módulo: REPORTES
- `reportes.ver` - Ver reportes
- `reportes.exportar` - Exportar reportes
- `reportes.ver_financieros` - Ver reportes financieros detallados

### Módulo: USUARIOS (Organización)
- `usuarios.ver` - Ver usuarios de la organización
- `usuarios.crear` - Crear usuarios
- `usuarios.editar` - Editar usuarios
- `usuarios.eliminar` - Eliminar usuarios
- `usuarios.asignar_roles` - Asignar roles a usuarios

### Módulo: CONFIGURACIÓN
- `configuracion.ver` - Ver configuración
- `configuracion.editar` - Editar configuración de la organización

---

## 🗂️ Script SQL para Crear Roles y Permisos

```sql
-- ============================================
-- CREAR ROLES DEL SISTEMA
-- ============================================

-- 1. SUPERADMIN (ya debería existir con idRol = 1)
INSERT INTO "ROL" ("nombreRol", "descripcionRol", "estadoRol", "fechaRegistroRol")
VALUES 
  ('SUPERADMIN', 'Administrador del sistema completo', TRUE, NOW())
ON CONFLICT DO NOTHING;

-- 2. Roles de Organización
INSERT INTO "ROL" ("nombreRol", "descripcionRol", "estadoRol", "fechaRegistroRol")
VALUES 
  ('ADMINISTRADOR', 'Administrador completo de la organización', TRUE, NOW()),
  ('VENDEDOR', 'Personal de ventas y atención al cliente', TRUE, NOW()),
  ('ALMACENERO', 'Encargado de inventario y almacén', TRUE, NOW()),
  ('COMPRADOR', 'Encargado de compras y proveedores', TRUE, NOW()),
  ('CONTADOR', 'Personal de finanzas y contabilidad', TRUE, NOW()),
  ('CAJERO', 'Personal de punto de venta', TRUE, NOW()),
  ('VISUALIZADOR', 'Solo lectura en todo el sistema', TRUE, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- CREAR PERMISOS
-- ============================================

-- Permisos de Productos
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('productos.ver', 'Ver productos', TRUE),
  ('productos.crear', 'Crear productos', TRUE),
  ('productos.editar', 'Editar productos', TRUE),
  ('productos.eliminar', 'Eliminar productos', TRUE),
  ('productos.ver_precio_costo', 'Ver precio de costo', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Categorías
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('categorias.ver', 'Ver categorías', TRUE),
  ('categorias.crear', 'Crear categorías', TRUE),
  ('categorias.editar', 'Editar categorías', TRUE),
  ('categorias.eliminar', 'Eliminar categorías', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Ventas
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('ventas.ver', 'Ver ventas', TRUE),
  ('ventas.crear', 'Crear ventas', TRUE),
  ('ventas.editar', 'Editar ventas', TRUE),
  ('ventas.anular', 'Anular ventas', TRUE),
  ('ventas.ver_todas', 'Ver todas las ventas', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Compras
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('compras.ver', 'Ver compras', TRUE),
  ('compras.crear', 'Crear compras', TRUE),
  ('compras.editar', 'Editar compras', TRUE),
  ('compras.anular', 'Anular compras', TRUE),
  ('compras.ver_todas', 'Ver todas las compras', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Inventario
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('inventario.ver', 'Ver inventario', TRUE),
  ('inventario.ajustar', 'Ajustar stock', TRUE),
  ('inventario.ver_movimientos', 'Ver movimientos', TRUE),
  ('inventario.crear_movimientos', 'Crear movimientos', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Clientes
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('clientes.ver', 'Ver clientes', TRUE),
  ('clientes.crear', 'Crear clientes', TRUE),
  ('clientes.editar', 'Editar clientes', TRUE),
  ('clientes.eliminar', 'Eliminar clientes', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Proveedores
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('proveedores.ver', 'Ver proveedores', TRUE),
  ('proveedores.crear', 'Crear proveedores', TRUE),
  ('proveedores.editar', 'Editar proveedores', TRUE),
  ('proveedores.eliminar', 'Eliminar proveedores', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Almacenes
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('almacenes.ver', 'Ver almacenes', TRUE),
  ('almacenes.crear', 'Crear almacenes', TRUE),
  ('almacenes.editar', 'Editar almacenes', TRUE),
  ('almacenes.eliminar', 'Eliminar almacenes', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Reportes
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('reportes.ver', 'Ver reportes', TRUE),
  ('reportes.exportar', 'Exportar reportes', TRUE),
  ('reportes.ver_financieros', 'Ver reportes financieros', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Usuarios
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('usuarios.ver', 'Ver usuarios', TRUE),
  ('usuarios.crear', 'Crear usuarios', TRUE),
  ('usuarios.editar', 'Editar usuarios', TRUE),
  ('usuarios.eliminar', 'Eliminar usuarios', TRUE),
  ('usuarios.asignar_roles', 'Asignar roles', TRUE)
ON CONFLICT DO NOTHING;

-- Permisos de Configuración
INSERT INTO "PERMISO" ("nombrePermiso", "descripcionPermiso", "estadoPermiso")
VALUES 
  ('configuracion.ver', 'Ver configuración', TRUE),
  ('configuracion.editar', 'Editar configuración', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- ASIGNAR PERMISOS A ROLES
-- ============================================

-- ADMINISTRADOR: Todos los permisos excepto superadmin
-- (Asignar todos los permisos excepto los de superadmin)

-- VENDEDOR: Permisos de ventas y clientes
-- (Asignar: ventas.*, clientes.*, productos.ver, inventario.ver, reportes.ver)

-- ALMACENERO: Permisos de inventario
-- (Asignar: inventario.*, productos.ver, almacenes.ver, compras.ver)

-- COMPRADOR: Permisos de compras
-- (Asignar: compras.*, proveedores.*, productos.ver, inventario.ver)

-- CONTADOR: Solo lectura
-- (Asignar: *.ver, reportes.*)

-- CAJERO: Ventas básicas
-- (Asignar: ventas.crear, ventas.ver, clientes.ver, productos.ver, inventario.ver)

-- VISUALIZADOR: Solo lectura en todo
-- (Asignar: *.ver, reportes.ver)

```

---

## 📊 Matriz de Permisos por Rol

| Permiso | Admin | Vendedor | Almacenero | Comprador | Contador | Cajero | Visualizador |
|---------|-------|----------|------------|-----------|----------|--------|-------------|
| productos.ver | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| productos.crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| productos.editar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ventas.crear | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| ventas.ver | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| ventas.anular | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| compras.crear | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| inventario.ajustar | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| usuarios.crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| reportes.ver | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

---

## 🎯 Recomendaciones

1. **Empieza simple:** Crea primero los roles básicos (ADMINISTRADOR, VENDEDOR, ALMACENERO)
2. **Personaliza según necesidad:** Cada organización puede tener necesidades diferentes
3. **Principio de menor privilegio:** Asigna solo los permisos necesarios
4. **Revisa periódicamente:** Los roles y permisos deben evolucionar con el negocio

---

## 📝 Notas de Implementación

- Los permisos se asignan a **roles**, no directamente a usuarios
- Un usuario puede tener **múltiples roles**
- Los permisos de un usuario = **unión de permisos de todos sus roles**
- El superadmin tiene acceso a todo automáticamente (no necesita permisos explícitos)

