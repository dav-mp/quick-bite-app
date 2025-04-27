// src/app/application/adapters/KitAdapter.ts

import { Kit } from "../../domain/models/kit/Kit";

/**
 * Adapta un objeto "raw" del backend a nuestro modelo de dominio `Kit`.
 */
export function kitAdapter(raw: any): Kit {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    description: raw.description,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    image: raw.image,
    ProductKit: raw.ProductKit?.map((pk: any) => ({
      quantity: pk.quantity,
      productId: pk.productId,
    })) || [],
    KitPrice: raw.KitPrice?.map((kp: any) => ({
      price: kp.price,
    })) || [],
  };
}

/**
 * Adapta un array "raw" del backend a un array de `Kit`.
 */
export function kitListAdapter(rawArray: any[]): Kit[] {
  return rawArray.map((item) => kitAdapter(item));
}
