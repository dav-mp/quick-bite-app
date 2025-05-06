import { Routes, Route } from "react-router-dom"
import RestaurantDashboard from "../pages/dashboard/RestaurantDashboard"
import RestaurantProducts from "../pages/products/RestaurantProducts"
import RestaurantOrderHistory from "../pages/orders/RestaurantOrderHistory"

const RestaurantRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<RestaurantDashboard />} />
      <Route path="products" element={<RestaurantProducts />} />
      <Route path="orders" element={<RestaurantOrderHistory />} />
      {/* other restaurant routes can be added here */}
    </Routes>
  )
}

export default RestaurantRoutes
