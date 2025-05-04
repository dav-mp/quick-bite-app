import { Restaurant } from "../restaurant/Restaurant";
import { Shift } from "../shiftRestaurant/Shift";

/**
 * Estructura que devuelve el backend al hacer loginRestaurant:
 * {
 *   restaurant: { ...datos del restaurante },
 *   shift: { ...turno abierto o recién creado },
 *   session: {
 *     token: string
 *   }
 * }
 */
export interface RestaurantAuthResponse {
  restaurant: Restaurant;
  shift: Shift;
  session: {
    token: string;
  };
}
