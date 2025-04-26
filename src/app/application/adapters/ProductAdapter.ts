// src/app/application/adapters/ProductAdapter.ts

import { Product } from "../../domain/models/product/Product";

/**
 * Adapta un objeto "raw" a nuestro modelo Product
 */
export function productAdapter(rawData: any): Product {
  return {
    id: rawData.id,
    name: rawData.name,
    categoryId: rawData.categoryId,
    description: rawData.description,
    status: rawData.status,
    createdAt: rawData.createdAt,
    updatedAt: rawData.updatedAt,
    image: rawData.image,
  };
}

/**
 * Adapta un arreglo de objetos "raw" a una lista de Product
 */
export function productListAdapter(rawArray: any[]): Product[] {
  return rawArray.map(item => productAdapter(item));
}
