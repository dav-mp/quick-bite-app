// src/app/infrastructure/usecases/RestaurantUseCase.ts

import { Restaurant } from "../../domain/models/restaurant/Restaurant";
import { IRestaurantRepository } from "../../domain/repositories/IRestaurantRepository";

export class RestaurantUseCase {
  constructor(private readonly restaurantRepo: IRestaurantRepository) {}

  /**
   * Recupera todos los restaurantes, independientemente de sus turnos.
   */
  async getAllRestaurants(): Promise<Restaurant[]> {
    const restaurants = await this.restaurantRepo.getAllRestaurant();
    // aquí podrías añadir alguna regla de negocio adicional si fuera necesario
    return restaurants;
  }

  /**
   * Recupera solo los restaurantes que actualmente están abiertos
   * (último turno sin closeShift).
   */
  async getOpenRestaurants(): Promise<Restaurant[]> {
    const open = await this.restaurantRepo.getRestaurantOpen();
    return open;
  }

  /**
   * Recupera todos los restaurantes que tengan al menos un turno registrado
   * (abierto o cerrado).
   */
  async getRestaurantsWithShifts(): Promise<Restaurant[]> {
    const withShifts = await this.restaurantRepo.getAllRestaurantsAnyShift();
    return withShifts;
  }
}
