import { createBrowserRouter, Navigate  } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import ClientesPage from "./modules/clientes/pages/ClientesPage";
import ProductoPage from "./modules/productos/pages/ProductoPage";
import { RolesPage1 } from "./modules/clientes";
import CategoriasPage from "./modules/categorias/pages/CategoriasPage";
import AlmacenesPage from "./modules/almacenes/pages/AlmacenesPage";
import ProveedorPage from "./modules/proveedores/pages/ProveedoresPage";
import TipoMovimientoPage from "./modules/tipoMovimientos/pages/TipoMovimientosPage";


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
      { path : "roles", element : <RolesPage1/>},
      { path : "productos", element : <ProductoPage/>},
      { path : "dashboard", element : <Dashboard/>},
      { path : "categorias", element : <CategoriasPage/>},
      { path : "almacenes", element : <AlmacenesPage/>},
      { path : "proveedores", element : <ProveedorPage/>},
      { path : "tipoMovimientos", element : <TipoMovimientoPage/>},
    ],
  },
]);