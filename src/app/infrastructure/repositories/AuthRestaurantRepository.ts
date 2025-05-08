import { IRestaurantAuthRepository } from "../../domain/repositories/IRestaurantAuthRepository";
import { RestaurantAuthResponse } from "../../domain/models/restaurantAuth/RestaurantAuthResponse";
import { axiosInstance } from "../api/axionInstance";
import { restaurantAuthAdapter } from "../../application/adapters/RestaurantAuthAdapter";

export class AuthRestaurantRepository implements IRestaurantAuthRepository {
  
  /**
   * POST /api/auth/restaurant/loginRestaurant
   * Body: { resId, password }
   */
  async loginRestaurant(resId: string, password: string): Promise<RestaurantAuthResponse> {
    try {
      const resp = await axiosInstance.post("/api/auth/restaurant/loginRestaurant", {
        resId,
        password,
      });
      // Adaptamos la data a nuestro modelo de dominio
      return restaurantAuthAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * POST /api/auth/restaurant/logoutRestaurant
   * Body: { restaurantId }
   * Retorna true o false
   */
  async logoutRestaurant(restaurantId: string): Promise<boolean> {
    try {
      const resp = await axiosInstance.post("/api/auth/restaurant/logoutRestaurant", {
        restaurantId,
      });
      // El backend envía `true` si cierra exitosamente, o un error
      return resp.data === true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }
}
