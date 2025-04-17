// src/adapters/restaurantAdapter.ts

import { Restaurant } from "../../domain/models/restaurant/Restaurant";
import { Shift } from "../../domain/models/shiftRestaurant/Shift";


/**
 * Adapta la respuesta "raw" de la API a nuestro modelo `Shift`.
 */
export function shiftAdapter(raw: any): Shift {
  return {
    id: raw.id,
    restaurantId: raw.restaurantId,
    openShift: raw.openShift,
    // si raw.closeShift viene definido, lo asignamos; si no, queda undefined
    closeShift: raw.closeShift ?? undefined,
  };
}

/**
 * Adapta la respuesta "raw" de la API a nuestro modelo `Restaurant`.
 */
export function restaurantAdapter(raw: any): Restaurant {
  return {
    id: raw.id,
    name: raw.name,
    resId: raw.resId,
    address: raw.address,
    status: raw.status,
    updatedAt: raw.updatedAt,
    createdAt: raw.createdAt,
    password: raw.password,
    image: raw.image,
    // mapeamos cada turno usando shiftAdapter; si no hay Shift, devolvemos array vacío
    Shift: Array.isArray(raw.Shift) ? raw.Shift.map(shiftAdapter) : [],
  };
}

/**
 * Adapta un arreglo de "raw" restaurants a un arreglo de `Restaurant`.
 */
export function restaurantListAdapter(rawArray: any[]): Restaurant[] {
  return rawArray.map(restaurantAdapter);
}
