import { Routes, Route } from "react-router-dom";
import StoreShowcase from "../components/store-showcase/store-showcase";
import CheckoutView from "../components/checkout/CheckoutView";
import OrdersView from "../pages/order/OrdersView";

const ExternalRoutes = () => {
  return (
    <Routes>
      <Route path="products" element={<StoreShowcase />} />
      <Route path="checkout" element={<CheckoutView />} />
      <Route path="orders" element={<OrdersView />} />
      {/* otras rutas hijas de /user */}
    </Routes>
  );
};

export default ExternalRoutes;
