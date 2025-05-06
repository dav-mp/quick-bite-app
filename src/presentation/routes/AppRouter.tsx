// Update the existing AppRouter.tsx to include restaurant routes
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginUser from "../users/pages/auth/login/LoginView"
import RegisterUser from "../users/pages/auth/register/RegisterView"
import { ProtectedRoute } from "./ProtectedRoute"
import ExternalRoutes from "../users/routes/UserRouter"
import MainLayout from "../shared/components/mainLayout/Main-layout"
import LoginRestaurant from "../restaurants/pages/auth/login/LoginRestaurantView"
import RestaurantLayout from "../restaurants/components/layout/RestaurantLayout"
import RestaurantRoutes from "../restaurants/routes/RestaurantRouter"

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de login y registro (globales) */}
        <Route path="/login-external" element={<LoginUser />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/login-restaurant" element={<LoginRestaurant />} />

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
          <Route path="*" element={<ExternalRoutes />} />
        </Route>

        {/*
          Rutas protegidas para restaurantes.
          Solo se accede a /restaurant/* si ProtectedRoute permite el acceso.
        */}
        <Route
          path="/restaurant/*"
          element={
            <ProtectedRoute redirectTo="/login-restaurant">
              <RestaurantLayout />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<RestaurantRoutes />} />
        </Route>

        {/* Ruta raíz o redirecciones */}
        <Route path="/" element={<LoginUser />} />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}
