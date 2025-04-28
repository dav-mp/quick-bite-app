// src/app/application/services/OrderUtils.ts
import {
  CreateOrderRequest,
  CreateOrderDetailRequest,
} from "../../domain/models/oreder/Order";
import { CartItem } from "../store/CartSlice";

/**
 * Calcula el totalPrice (en este ejemplo, sumando naive los precios).
 * Ajusta la lógica de obtención de precio (puede que uses productPriceEspecialId).
 */
function calculateItemPrice(cartItem: CartItem): number {
  if (cartItem.type === "product" && cartItem.product) {
    // Buscar el precio en productPrices
    // O si tu componente ya guardó un `price` calculado en el cartItem, úsalo directamente
    const priceObj = cartItem.product.productPrices?.find(
      (p) => p.id === cartItem.selectedPriceId
    );
    const price = priceObj?.price ?? 0;
    return price * cartItem.quantity;
  } else if (cartItem.type === "kit" && cartItem.kit) {
    // Supongamos que un kit solo tiene un KitPrice principal
    const priceKit = cartItem.kit.KitPrice[0]?.price ?? 0;
    return priceKit * cartItem.quantity;
  }
  return 0;
}

/**
 * Construye un array de detalles de la orden. 
 * Para productos: agregamos un objeto con `productId, quantity, productPriceEspecialId`.
 * 
 * Para kits: **IMPORTANTÍSIMO**: el backend exige siempre `productId`, 
 * así que necesitamos desglosar el kit en varios objetos, 
 * uno por cada producto del kit, todos con el mismo `kitId`.
 * 
 * De esta forma cumplimos con el zod schema que obliga `productId` en cada línea de detalle.
 */
function buildOrderDetails(cartItems: CartItem[]): CreateOrderDetailRequest[] {
  const details: CreateOrderDetailRequest[] = [];

  for (const item of cartItems) {
    if (item.type === "product" && item.product) {
      // Un solo objeto con productId + (opcional) productPriceEspecialId
      details.push({
        productId: item.product.id,
        quantity: item.quantity,
        productPriceEspecialId: item.selectedPriceId, // si aplica
      });

    } else if (item.type === "kit" && item.kit) {
      // El backend requiere "productId" siempre, así que generamos
      // múltiples líneas, una por cada producto integrante del kit:
      item.kit.ProductKit.forEach((kitProduct) => {
        details.push({
          // Asignamos productId y kitId
          productId: kitProduct.productId,
          kitId: item.kit?.id,
          // La cantidad es la del kit * la cantidad interna de cada producto 
          quantity: kitProduct.quantity * item.quantity,
        });
      });
    }
  }

  return details;
}

/**
 * Calcula la sumatoria total de todo el carrito.
 */
function calculateCartTotal(cartItems: CartItem[]): number {
  let total = 0;
  for (const item of cartItems) {
    total += calculateItemPrice(item);
  }
  return total;
}

/**
 * Crea el objeto `CreateOrderRequest` listo para enviarse a tu backend.
 * - customerId: ID del usuario que crea la orden
 * - restaurantId: ID del restaurante
 */
export function buildCreateOrderRequest(
  cartItems: CartItem[],
  customerId: string,
  restaurantId: string
): CreateOrderRequest {
  const totalPrice = calculateCartTotal(cartItems);
  const orderDetail = buildOrderDetails(cartItems);

  const request: CreateOrderRequest = {
    customerId,
    restaurantId,
    // Si tu backend usa `orderDate` en segundos, conviene Date.now()/1000; 
    // aunque en tu backend convierten con `new Date(orderDate * 1000)`.
    // Aquí solo enviamos el timestamp entero (segundos).
    orderDate: Math.floor(Date.now() / 1000), 
    totalPrice,
    orderDetail,
  };

  return request;
}
