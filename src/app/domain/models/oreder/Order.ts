// ===========================================================
// File: src/app/domain/models/OrderModels.ts
// ===========================================================

import { Kit } from "../kit/Kit";
import { Product } from "../product/Product";


/**
 * Posibles estados de una Orden.
 * (Alineado con StatusOrder del backend)
 */
export enum StatusOrder {
  Created = 'created',
  Accepted = 'accepted',
  Finalized = 'finalized',
}

/**
 * Interfaz para la petición de crear Orden (cliente -> backend).
 * Es equivalente a tu CreateOrderDTO del backend,
 * pero en el frontend la nombramos diferente si lo deseas.
 */
export interface CreateOrderRequest {
  customerId: string;
  restaurantId: string;
  orderDate: number;     // marca de tiempo (timestamp en segundos)
  totalPrice: number;
  orderDetail: CreateOrderDetailRequest[];
}

/**
 * Detalle de la orden a enviar cuando se crea.
 * Es equivalente a tu CreateOrderDetailDTO del backend.
 */
export interface CreateOrderDetailRequest {
  productId: string;
  quantity: number;
  productPriceEspecialId?: string;
  kitId?: string;
}

/**
 * Petición para obtener todas las órdenes de un usuario.
 * (user -> backend)
 */
export interface GetAllOrdersByCustomerRequest {
  customerId: string;
}

/**
 * Petición para que un restaurante obtenga sus órdenes activas o su historial.
 * (restaurant -> backend)
 */
export interface GetOrdersByRestaurantRequest {
  restaurantId: string;
}

/**
 * Petición para cambiar el estado de una orden.
 * (restaurant -> backend)
 */
export interface ChangeStatusOrderRequest {
  restaurantId: string;
  orderId: string;
  status: StatusOrder;
}

/**
 * Representa la respuesta que retorna el backend para una Orden 
 * **transformada** (ya agrupada en `singleProducts` y `kits`).
 * Esto es lo que el frontend podría recibir al llamar
 * a los endpoints: getAllOrdersByCustomerId, getActiveOrders, etc.
 */
export interface TransformedOrder {
  id: string;
  customerId: string;
  restaurantId: string;
  orderDate: string;   // o Date, según necesites
  totalPrice: number;
  status: StatusOrder;
  createdAt: string;   // o Date
  updatedAt: string;   // o Date
  OrderDetail: {
    singleProducts: SingleProductDetail[];
    kits: KitDetail[];
  };
  Customer?: CustomerInfo;     // Si el backend retorna la info del Customer
  Restaurant?: RestaurantInfo; // Si el backend retorna la info del Restaurant
}

/**
 * Un producto individual dentro de la Orden.
 */
export interface SingleProductDetail {
  id: string;         // id del registro en el detalle de la orden
  productId: string;  // referencia al product
  quantity: number;
  Product: Product;   // el objeto Product completo, importado de tu modelo
}

/**
 * Un kit (agrupación) dentro de la Orden.
 */
export interface KitDetail {
  id: string;       // id del registro en el detalle de la orden (OrderDetail)
  kitId: string;    // referencia al kit
  quantity: number; // Cantidad de kits
  Kit: Kit;         // Objeto Kit (importado de tu modelo)
  products: {
    id: string;
    productId: string;
    quantity: number;
    Product: Product;  // El objeto Product para cada producto dentro del kit
  }[];
}

/**
 * Ejemplo de interfaz para la información del cliente (Customer)
 * que retorna el backend al consultar órdenes.
 */
export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  userName?: string;
}

/**
 * Ejemplo de interfaz para la información del restaurante.
 */
export interface RestaurantInfo {
  id: string;
  image?: string | null;
  name: string;
  address: string;
}
