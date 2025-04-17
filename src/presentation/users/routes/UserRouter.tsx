import { Routes, Route } from "react-router-dom";
import StoreShowcase from "../components/store-showcase/store-showcase";

const ExternalRoutes = () => {
  return (
    <Routes>
      <Route path="products" element={<StoreShowcase />} />
      {/* otras rutas hijas de /user */}
    </Routes>
  );
};

export default ExternalRoutes;
