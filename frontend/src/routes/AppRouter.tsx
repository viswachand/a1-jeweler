import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

        {/* Public Login Route */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
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

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
