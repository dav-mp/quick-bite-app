// src/app/infrastructure/repositories/RestaurantRepository.ts

import { IRestaurantRepository } from "../../domain/repositories/IRestaurantRepository";
import { Restaurant } from "../../domain/models/restaurant/Restaurant";
import { axiosInstance } from "../api/axionInstance";
import { restaurantListAdapter } from "../../application/adapters/RestaurantAdapter";

export class RestaurantRepository implements IRestaurantRepository {
  /**
   * Obtiene todos los restaurantes (independientemente de su turno).
   */
  async getAllRestaurant(): Promise<Restaurant[]> {
    try {
      const resp = await axiosInstance.post("/api/restaurant/getAll");
      return restaurantListAdapter(resp.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Obtiene únicamente los restaurantes que actualmente están abiertos
   * (es decir, cuyo último turno no tiene closeShift).
   */
  async getRestaurantOpen(): Promise<Restaurant[]> {
    try {
      const resp = await axiosInstance.post("/api/restaurant/getRestaurantsOpen");
      return restaurantListAdapter(resp.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Obtiene todos los restaurantes que tienen al menos un turno (abierto o cerrado).
   */
  async getAllRestaurantsAnyShift(): Promise<Restaurant[]> {
    try {
      const resp = await axiosInstance.post("/api/restaurant/getAllRestaurantsAnyShift");
      return restaurantListAdapter(resp.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}
