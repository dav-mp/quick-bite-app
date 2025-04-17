import { Restaurant } from "../models/restaurant/Restaurant";

export interface IRestaurantRepository {
    getAllRestaurant(): Promise<Restaurant[]>;
    getRestaurantOpen(): Promise<Restaurant[]>;
    getAllRestaurantsAnyShift(): Promise<Restaurant[]>;
}