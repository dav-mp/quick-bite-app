// ===========================================================
// File: src/app/application/adapters/OrderAdapter.ts
// ===========================================================

import { TransformedOrder } from "../../domain/models/oreder/Order";


/**
 * Ejemplo de adaptador para transformar la respuesta en caso
 * de que el backend la mande en un formato distinto al que
 * el frontend desea. Si tu backend ya manda un JSON
 * idéntico a `TransformedOrder`, podrías no necesitar esto.
 */
export function orderAdapter(rawData: any): TransformedOrder {
  return {
    id: rawData.id,
    customerId: rawData.customerId,
    restaurantId: rawData.restaurantId,
    orderDate: rawData.orderDate,
    totalPrice: rawData.totalPrice,
    status: rawData.status,
    createdAt: rawData.createdAt,
    updatedAt: rawData.updatedAt,
    OrderDetail: {
      singleProducts: rawData.OrderDetail.singleProducts || [],
      kits: rawData.OrderDetail.kits || []
    },
    Customer: rawData.Customer || undefined,
    Restaurant: rawData.Restaurant || undefined,
  };
}

/**
 * Adaptador para listas de órdenes transformadas.
 */
export function orderListAdapter(rawArray: any[]): TransformedOrder[] {
  return rawArray.map(orderAdapter);
}
