# Guía: Asignar Usuarios a una Organización

## 📋 Flujo Completo

### Paso 1: Crear la Organización ✅ (Ya completado)
- Has creado la organización exitosamente
- La organización tiene un plan asignado

### Paso 2: Asignar Usuarios a la Organización

#### Opción A: Usuario ya existe en el sistema (se autenticó antes)

1. **Ve a la página de Organizaciones:**
   - Como superadmin, ve a `/home/organizaciones`
   - O desde el menú lateral: **Administración > Organizaciones**

2. **Encuentra tu organización:**
   - Busca la organización que acabas de crear en la tabla

3. **Haz clic en el botón "Usuarios":**
   - En la columna "Acciones", haz clic en el botón **"Usuarios"** (botón morado)

4. **Selecciona un usuario:**
   - Se abrirá un modal con la lista de usuarios sin organización
   - Selecciona el usuario que quieres asignar

5. **Asigna roles:**
   - Selecciona uno o más roles para ese usuario
   - Los roles determinan qué puede hacer el usuario en el sistema
   - Ejemplos de roles: Administrador, Vendedor, Almacenero, etc.

6. **Confirma la asignación:**
   - Haz clic en "Asignar Usuario"
   - El usuario quedará asignado a la organización con los roles seleccionados

#### Opción B: Usuario nuevo (primera vez que se autentica)

1. **El usuario debe autenticarse primero:**
   - El usuario va a `/login`
   - Se autentica con email/password o Google OAuth
   - Al autenticarse, se crea automáticamente en la tabla `USUARIO` (sin organización)

2. **El usuario verá el mensaje "Acceso Pendiente":**
   - El sistema detecta que no tiene organización asignada
   - Muestra un modal indicando que debe esperar a ser asignado

3. **Como superadmin, asigna el usuario:**
   - Sigue los pasos de la Opción A
   - El usuario aparecerá en la lista de "usuarios sin organización"

### Paso 3: El Usuario Inicia Sesión

Una vez asignado a la organización:

1. **El usuario va a `/login`**

2. **Se autentica:**
   - Con email/password (si tiene contraseña)
   - O con Google OAuth

3. **El sistema verifica:**
   - ✅ Usuario autenticado
   - ✅ Usuario tiene organización asignada
   - ✅ Usuario tiene roles asignados

4. **Acceso al sistema:**
   - El usuario es redirigido a `/home`
   - Puede acceder a todos los módulos según sus roles y permisos:
     - **Productos** - Gestionar catálogo de productos
     - **Ventas** - Crear y gestionar ventas
     - **Compras** - Gestionar compras
     - **Inventario** - Ver y gestionar stock
     - **Clientes** - Gestionar clientes
     - **Reportes** - Ver reportes y análisis
     - Y más...

## 🎯 Roles y Permisos

### Roles Comunes para una Organización:

1. **Administrador de Organización:**
   - Puede gestionar usuarios de su organización
   - Acceso completo a todos los módulos
   - Puede configurar la organización

2. **Vendedor:**
   - Puede crear ventas
   - Ver productos e inventario
   - Gestionar clientes

3. **Almacenero:**
   - Gestionar inventario
   - Registrar movimientos de stock
   - Ver productos

4. **Contador/Finanzas:**
   - Ver reportes
   - Ver ventas y compras
   - Análisis financiero

### Nota sobre Permisos:
- Los permisos se asignan a los **roles**, no directamente a usuarios
- Un usuario puede tener **múltiples roles**
- Los permisos de un usuario = unión de permisos de todos sus roles

## 📝 Ejemplo Práctico

### Escenario: Asignar el primer usuario a tu organización

1. **Usuario se autentica:**
   ```
   Email: juan@empresa.com
   Método: Google OAuth o Email/Password
   ```

2. **Usuario ve "Acceso Pendiente"**

3. **Superadmin asigna usuario:**
   - Va a Organizaciones
   - Clic en "Usuarios" de la organización
   - Selecciona: juan@empresa.com
   - Asigna roles: "Administrador de Organización"
   - Confirma

4. **Usuario inicia sesión nuevamente:**
   - Va a `/login`
   - Se autentica
   - ✅ Acceso completo al sistema
   - Puede gestionar productos, ventas, etc.

## 🔍 Verificar Usuarios de una Organización

Para ver qué usuarios están asignados a una organización:

1. Ve a `/home/organizaciones`
2. Haz clic en "Usuarios" de la organización
3. O ve a `/home/usuarios` (solo superadmin)
   - Verás todos los usuarios del sistema
   - Filtrados por organización

## ⚠️ Importante

- **Solo superadmins** pueden asignar usuarios a organizaciones
- Los usuarios **NO pueden** asignarse a sí mismos
- Un usuario solo puede pertenecer a **una organización** a la vez
- Si un usuario necesita cambiar de organización, el superadmin debe:
  1. Removerlo de la organización actual
  2. Asignarlo a la nueva organización

## 🚀 Siguiente Paso

Una vez que asignes usuarios a la organización, ellos podrán:
- Iniciar sesión normalmente
- Acceder a todos los módulos según sus roles
- Gestionar productos, ventas, inventario, etc.
- Todo estará aislado por organización (multi-tenant)

