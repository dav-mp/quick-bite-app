// src/app/application/adapters/CategoryAdapter.ts

import { Category } from "../../domain/models/category/Category";

/**
 * Adapta un objeto "raw" a nuestro modelo Category
 */
export function categoryAdapter(rawData: any): Category {
  return {
    id: rawData.id,
    name: rawData.name,
    status: rawData.status,
    updatedAt: rawData.updatedAt,
    createdAt: rawData.createdAt,
  };
}

/**
 * Adapta un arreglo de objetos "raw" a una lista de Category
 */
export function categoryListAdapter(rawArray: any[]): Category[] {
  return rawArray.map(item => categoryAdapter(item));
}
