// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/pageNotFound";
import PolicyForm from "@/pages/policy";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import Sales from "@/pages/sales";
import Items from "@/pages/items";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect base path */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Public Route for Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Private Route for Dashboard inside Layout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <AppLayout>
                <Sales />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/policy"
          element={
            <PrivateRoute>
              <AppLayout>
                <PolicyForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/items"
          element={
            <PrivateRoute>
              <AppLayout>
                <Items />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Fallback Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
