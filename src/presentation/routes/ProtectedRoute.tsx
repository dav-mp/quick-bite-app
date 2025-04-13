import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getDataCookies } from "../../app/infrastructure/service/CookiesService";
import { DataCookies } from "../../app/domain/models/cookies/DataCookies";

interface ProtectedRouteProps {
  redirectTo: string;        // ruta a la que se redirige si no tiene permiso
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectTo = "/login-external",
  children,
}) => {

    const isAllowed = getDataCookies( DataCookies.ACCESSTOKEN )

    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    // Si hay hijos, renderiza hijos; si no, renderiza <Outlet> 
    // para anidar sub-rutas
    return children ? <>{children}</> : <Outlet />;
};
