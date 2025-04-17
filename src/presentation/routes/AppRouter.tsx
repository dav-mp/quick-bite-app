// AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginUser from "../users/pages/auth/login/LoginView";
import RegisterUser from "../users/pages/auth/register/RegisterView";
import { ProtectedRoute } from "./ProtectedRoute";
import ExternalRoutes from "../users/routes/UserRouter";
import MainLayout from "../shared/components/mainLayout/Main-layout";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de login y registro (globales) */}
        <Route path="/login-external" element={<LoginUser />} />
        <Route path="/register" element={<RegisterUser />} />

        {/*
          Rutas protegidas para usuarios externos.
          Solo se accede a /user/* si ProtectedRoute permite el acceso.
        */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute redirectTo="/login-external">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Aquí: en lugar de `Route index element={<ExternalRoutes />}` 
              usamos `Route path="*" element={<ExternalRoutes />}` */}
          <Route path="*" element={<ExternalRoutes />} />
        </Route>

        {/* Ruta raíz o redirecciones */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
