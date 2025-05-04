import { AuthRestaurantRepository } from "../repositories/AuthRestaurantRepository";
import { RestaurantAuthUseCase } from "../usecases/RestaurantAuthUseCase";

// 1) Instanciamos el repositorio
const authRestaurantRepository = new AuthRestaurantRepository();

// 2) Inyectamos el repositorio al caso de uso
export const restaurantAuthUseCase = new RestaurantAuthUseCase(authRestaurantRepository);
