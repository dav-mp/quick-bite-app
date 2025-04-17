// src/app/infrastructure/DI/RestaurantContainer.ts

import { RestaurantRepository } from "../repositories/RestaurantRepository";
import { RestaurantUseCase } from "../usecases/RestaurantUseCase";

// 1) Instanciamos el repositorio de restaurantes
const restaurantRepository = new RestaurantRepository();

// 2) Inyectamos el repositorio al caso de uso
export const restaurantUseCase = new RestaurantUseCase(restaurantRepository);
