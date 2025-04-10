// AppRouter.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginUser from "../users/pages/auth/login/LoginView";
import RegisterUser from "../users/pages/auth/register/RegisterView";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de login y registro (globales) */}
        <Route path="/login-external" element={<LoginUser />} />
        {/* <Route path="/login-internal" element={<LoginInternal />} /> */}
        <Route path="/register" element={<RegisterUser />} />

        {/* Rutas externas */}
        {/* <Route path="/external/*" element={<ExternalRoutes />} /> */}

        {/* Rutas internas */}
        {/* <Route path="/internal/*" element={<InternalRoutes />} /> */}

        {/* Ruta raíz o redirecciones */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
