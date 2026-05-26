import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Categorias from "../pages/categorias/Categorias";
import Cuentas from "../pages/cuentas/Cuentas";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/Login";
import Mesas from "../pages/mesas/Mesas";
import Productos from "../pages/productos/Productos";
import Reportes from "../pages/reportes/Reportes";
import Ventas from "../pages/ventas/Ventas";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/productos"
          element={
            <DashboardLayout>
              <Productos />
            </DashboardLayout>
          }
        />
        <Route
          path="/categorias"
          element={
            <DashboardLayout>
              <Categorias />
            </DashboardLayout>
          }
        />
        <Route
          path="/inventario"
          element={
            <DashboardLayout>
              <Productos inventoryMode />
            </DashboardLayout>
          }
        />
        <Route
          path="/mesas"
          element={
            <DashboardLayout>
              <Mesas />
            </DashboardLayout>
          }
        />
        <Route
          path="/cuentas"
          element={
            <DashboardLayout>
              <Cuentas />
            </DashboardLayout>
          }
        />
        <Route
          path="/ventas"
          element={
            <DashboardLayout>
              <Ventas />
            </DashboardLayout>
          }
        />
        <Route
          path="/reportes"
          element={
            <DashboardLayout>
              <Reportes />
            </DashboardLayout>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
