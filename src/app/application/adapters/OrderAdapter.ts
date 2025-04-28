// ===========================================================
// File: src/app/application/adapters/OrderAdapter.ts
// ===========================================================

import { TransformedOrder } from "../../domain/models/oreder/Order";

/**
 * Adaptador para transformar la respuesta en caso
 * de que el backend la mande en un formato distinto al que
 * el frontend desea (TransformedOrder).
 */
export function orderAdapter(rawData: any): TransformedOrder {
  console.log(rawData);
  
  return {
    id: rawData?.id ?? "",
    customerId: rawData?.customerId ?? "",
    restaurantId: rawData?.restaurantId ?? "",
    // OJO: orderDate en el backend puede ser string; ajusta según necesites
    orderDate: rawData?.orderDate ?? "",
    totalPrice: rawData?.totalPrice ?? 0,
    status: rawData?.status ?? "created",
    createdAt: rawData?.createdAt ?? "",
    updatedAt: rawData?.updatedAt ?? "",
    // Si no existe OrderDetail, usa un objeto vacío y luego fallback a []
    OrderDetail: {
      singleProducts: rawData?.OrderDetail?.singleProducts ?? [],
      kits: rawData?.OrderDetail?.kits ?? []
    },
    Customer: rawData?.Customer || undefined,
    Restaurant: rawData?.Restaurant || undefined,
  };
}

/**
 * Adaptador para listas de órdenes transformadas.
 */
export function orderListAdapter(rawArray: any[]): TransformedOrder[] {
  return rawArray.map(orderAdapter);
}
