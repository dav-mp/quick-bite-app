import { RestaurantAuthResponse } from "../models/restaurantAuth/RestaurantAuthResponse";

export interface IRestaurantAuthRepository {
  /**
   * Llama al endpoint /api/auth/restaurant/loginRestaurant
   */
  loginRestaurant(resId: string, password: string): Promise<RestaurantAuthResponse>;

  /**
   * Llama al endpoint /api/auth/restaurant/logoutRestaurant
   */
  logoutRestaurant(restaurantId: string): Promise<boolean>;
}
