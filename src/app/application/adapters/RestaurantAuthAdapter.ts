import { RestaurantAuthResponse } from "../../domain/models/restaurantAuth/RestaurantAuthResponse";
import { restaurantAdapter, shiftAdapter } from "./RestaurantAdapter";

/**
 * Mapea la respuesta de loginRestaurant / logoutRestaurant a nuestro modelo `RestaurantAuthResponse`.
 * En este caso, logout solo retorna true/false, así que el adaptador se usa sobre todo para login.
 */
export function restaurantAuthAdapter(rawData: any): RestaurantAuthResponse {
  return {
    restaurant: restaurantAdapter(rawData.restaurant),
    shift: shiftAdapter(rawData.shift),
    session: {
      token: rawData?.session?.token || "",
    },
  };
}
