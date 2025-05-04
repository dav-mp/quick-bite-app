import { IRestaurantAuthRepository } from "../../domain/repositories/IRestaurantAuthRepository";
import { RestaurantAuthResponse } from "../../domain/models/restaurantAuth/RestaurantAuthResponse";

export class RestaurantAuthUseCase {
  constructor(private readonly repo: IRestaurantAuthRepository) {}

  async loginRestaurant(resId: string, password: string): Promise<RestaurantAuthResponse> {
    if (!resId || !password) {
      throw new Error("resId y password son requeridos para hacer login del restaurante");
    }
    return this.repo.loginRestaurant(resId, password);
  }

  async logoutRestaurant(restaurantId: string): Promise<boolean> {
    if (!restaurantId) {
      throw new Error("Se requiere el restaurantId para hacer logout");
    }
    return this.repo.logoutRestaurant(restaurantId);
  }
}
