import { createBrowserRouter, Navigate  } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import ClientesPage from "./modules/clientes/pages/ClientesPage";
import ProductoPage from "./modules/productos/pages/ProductoPage";
import CategoriasPage from "./modules/categorias/pages/CategoriasPage";
import AlmacenesPage from "./modules/almacenes/pages/AlmacenesPage";
import ProveedorPage from "./modules/proveedores/pages/ProveedoresPage";
import TipoMovimientoPage from "./modules/tipoMovimientos/pages/TipoMovimientosPage";
import VentasPage from "./modules/ventas/pages/VentasPage";
import ComprasPage from "./modules/compras/pages/ComprasPage";
import InventarioPage from "./modules/inventario/pages/InventarioPage";
import MovimientosInventarioPage from "./modules/movimientosInventario/pages/MovimientosInventarioPage";
import ReportesPage from "./modules/reportes/pages/ReportesPage";
import PermisosPage from "./modules/permisos/pages/PermisosPage";
import { OrganizacionesPage } from "./modules/organizaciones";
import { UsuariosPage } from "./modules/usuarios";
import { RolesPage } from "./modules/roles";
import { PlanesPage } from "./modules/planes";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />, // ✅ Redirige a login
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <Layout />,
    children: [
      { index: true, element: <Home/> },
      { path : "roles", element : <RolesPage/>},
      { path : "productos", element : <ProductoPage/>},
      { path : "dashboard", element : <Dashboard/>},
      { path : "categorias", element : <CategoriasPage/>},
      { path : "almacenes", element : <AlmacenesPage/>},
      { path : "proveedores", element : <ProveedorPage/>},
      { path : "tipoMovimientos", element : <TipoMovimientoPage/>},
      { path : "ventas", element : <VentasPage/>},
      { path : "compras", element : <ComprasPage/>},
      { path : "inventario", element : <InventarioPage/>},
      { path : "movimientos-inventario", element : <MovimientosInventarioPage/>},
      { path : "reportes", element : <ReportesPage/>},
      { path : "clientes", element : <ClientesPage/>},
      { path : "permisos", element : <PermisosPage/>},
      { path : "organizaciones", element : <OrganizacionesPage/>},
      { path : "usuarios", element : <UsuariosPage/>},
      { path : "planes", element : <PlanesPage/>},
    ],
  },
]);