# Guía de Implementación de Permisos en el Sistema

## 📋 Resumen

Se ha implementado un sistema completo de control de acceso basado en roles y permisos (RBAC) que permite mostrar/ocultar módulos, botones y funcionalidades según los permisos del usuario.

## 🎯 Componentes Creados

### 1. Hook `usePermissions`
**Ubicación:** `src/hooks/usePermissions.js`

**Funcionalidades:**
- Obtiene los permisos del usuario actual
- Verifica si es superadmin
- Proporciona funciones para verificar permisos y roles

**Uso:**
```javascript
import { usePermissions } from "../hooks/usePermissions";

const { tienePermiso, isSuperAdmin, permisos, roles } = usePermissions();

// Verificar un permiso
if (tienePermiso("productos.crear")) {
  // Mostrar botón de crear
}

// Verificar múltiples permisos (cualquiera)
if (tieneAlgunPermiso(["productos.crear", "productos.editar"])) {
  // Mostrar opciones
}

// Verificar múltiples permisos (todos)
if (tieneTodosLosPermisos(["ventas.crear", "ventas.editar"])) {
  // Mostrar funcionalidad avanzada
}
```

### 2. Componente `PermisoGuard`
**Ubicación:** `src/components/PermisoGuard.jsx`

**Funcionalidad:** Muestra contenido solo si el usuario tiene el permiso requerido.

**Uso:**
```javascript
import PermisoGuard from "../components/PermisoGuard";

// Proteger un botón
<PermisoGuard permiso="productos.crear">
  <button>Nuevo Producto</button>
</PermisoGuard>

// Proteger con múltiples permisos (cualquiera)
<PermisoGuard permiso={["productos.crear", "productos.editar"]}>
  <button>Gestionar Productos</button>
</PermisoGuard>

// Proteger con múltiples permisos (todos requeridos)
<PermisoGuard permiso={["ventas.crear", "ventas.editar"]} requerirTodos={true}>
  <button>Ventas Avanzadas</button>
</PermisoGuard>

// Con contenido alternativo si no tiene permisos
<PermisoGuard 
  permiso="productos.eliminar"
  fallback={<span className="text-gray-400">Sin permisos</span>}
>
  <button>Eliminar</button>
</PermisoGuard>
```

### 3. Componente `RolGuard`
**Ubicación:** `src/components/PermisoGuard.jsx` (exportado)

**Funcionalidad:** Muestra contenido solo si el usuario tiene el rol requerido.

**Uso:**
```javascript
import { RolGuard } from "../components/PermisoGuard";

<RolGuard rol="ADMINISTRADOR">
  <button>Solo para Administradores</button>
</RolGuard>

<RolGuard rol={["ADMINISTRADOR", "VENDEDOR"]}>
  <button>Para Admin o Vendedor</button>
</RolGuard>
```

### 4. Componente `PermisoRoute`
**Ubicación:** `src/components/PermisoRoute.jsx`

**Funcionalidad:** Protege rutas completas según permisos.

**Uso:**
```javascript
import PermisoRoute from "../components/PermisoRoute";

// En el router
{
  path: "productos",
  element: (
    <PermisoRoute permiso="productos.ver">
      <ProductoPage />
    </PermisoRoute>
  )
}
```

## 📝 Ejemplos de Implementación

### Ejemplo 1: Página de Productos

```javascript
import PermisoGuard from "../../../components/PermisoGuard";
import { usePermissions } from "../../../hooks/usePermissions";

export default function ProductoPage() {
  const { tienePermiso, isSuperAdmin } = usePermissions();
  
  return (
    <div>
      <h1>Productos</h1>
      
      {/* Botón solo visible si tiene permiso de crear */}
      <PermisoGuard permiso="productos.crear">
        <button>+ Nuevo Producto</button>
      </PermisoGuard>
      
      {/* Tabla de productos */}
      <table>
        {productos.map(producto => (
          <tr key={producto.id}>
            <td>{producto.nombre}</td>
            
            {/* Botones de acción protegidos */}
            <td>
              <PermisoGuard permiso="productos.editar">
                <button>Editar</button>
              </PermisoGuard>
              
              <PermisoGuard permiso="productos.eliminar">
                <button>Eliminar</button>
              </PermisoGuard>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### Ejemplo 2: Sidebar con Menú Condicional

```javascript
import { usePermissions } from "../hooks/usePermissions";

export default function Sidebar() {
  const { tienePermiso, isSuperAdmin } = usePermissions();
  
  return (
    <aside>
      {/* Solo mostrar si tiene permiso de ver productos */}
      {(isSuperAdmin || tienePermiso("productos.ver")) && (
        <NavLink to="/home/productos">📦 Productos</NavLink>
      )}
      
      {/* Solo mostrar si tiene permiso de ver ventas */}
      {(isSuperAdmin || tienePermiso("ventas.ver")) && (
        <NavLink to="/home/ventas">💰 Ventas</NavLink>
      )}
    </aside>
  );
}
```

### Ejemplo 3: Proteger Rutas en el Router

```javascript
import PermisoRoute from "./components/PermisoRoute";

export const router = createBrowserRouter([
  {
    path: "/home",
    element: <Layout />,
    children: [
      {
        path: "productos",
        element: (
          <PermisoRoute permiso="productos.ver">
            <ProductoPage />
          </PermisoRoute>
        )
      },
      {
        path: "ventas",
        element: (
          <PermisoRoute permiso="ventas.ver">
            <VentasPage />
          </PermisoRoute>
        )
      }
    ]
  }
]);
```

## 🔐 Permisos por Módulo

### Productos
- `productos.ver` - Ver productos
- `productos.crear` - Crear productos
- `productos.editar` - Editar productos
- `productos.eliminar` - Eliminar productos
- `productos.ver_precio_costo` - Ver precio de costo

### Ventas
- `ventas.ver` - Ver ventas
- `ventas.crear` - Crear ventas
- `ventas.editar` - Editar ventas
- `ventas.anular` - Anular ventas
- `ventas.ver_todas` - Ver todas las ventas

### Compras
- `compras.ver` - Ver compras
- `compras.crear` - Crear compras
- `compras.editar` - Editar compras
- `compras.anular` - Anular compras

### Inventario
- `inventario.ver` - Ver inventario
- `inventario.ajustar` - Ajustar stock
- `inventario.ver_movimientos` - Ver movimientos
- `inventario.crear_movimientos` - Crear movimientos

### Clientes
- `clientes.ver` - Ver clientes
- `clientes.crear` - Crear clientes
- `clientes.editar` - Editar clientes
- `clientes.eliminar` - Eliminar clientes

### Usuarios
- `usuarios.ver` - Ver usuarios
- `usuarios.crear` - Crear usuarios
- `usuarios.editar` - Editar usuarios
- `usuarios.asignar_roles` - Asignar roles

## 📋 Checklist de Implementación

Para cada módulo/CRUD, implementa:

- [ ] **Sidebar:** Mostrar/ocultar enlace del módulo según `modulo.ver`
- [ ] **Página Principal:** Verificar permiso `modulo.ver` para acceder
- [ ] **Botón "Nuevo":** Proteger con `modulo.crear`
- [ ] **Botón "Editar":** Proteger con `modulo.editar` en cada fila
- [ ] **Botón "Eliminar":** Proteger con `modulo.eliminar` en cada fila
- [ ] **Campos Sensibles:** Proteger con permisos específicos (ej: `productos.ver_precio_costo`)
- [ ] **Acciones Especiales:** Proteger con permisos específicos (ej: `ventas.anular`)

## 🎯 Mejores Prácticas

1. **Principio de Menor Privilegio:** Asigna solo los permisos necesarios
2. **Verificación Doble:** Protege tanto en el frontend como en el backend
3. **Mensajes Claros:** Si ocultas un botón, considera mostrar un mensaje explicativo
4. **Performance:** El hook `usePermissions` cachea los permisos, pero recarga cuando cambia la autenticación
5. **Testing:** Verifica que los permisos funcionan correctamente en diferentes roles

## 🚀 Próximos Pasos

1. Aplicar permisos a todos los módulos CRUD restantes
2. Proteger rutas en el router
3. Agregar validación de permisos en el backend (RLS de Supabase)
4. Crear página de "Acceso Denegado" personalizada
5. Agregar indicadores visuales de permisos (badges, tooltips)

