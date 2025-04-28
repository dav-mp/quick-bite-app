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
    // Supongamos que un kit solo tiene un KitPrice
    const priceKit = cartItem.kit.KitPrice[0]?.price ?? 0;
    return priceKit * cartItem.quantity;
  }
  return 0;
}

/**
 * Construye un array de detalles de la orden. 
 * Para productos: fill `productId, quantity, productPriceEspecialId`.
 * Para kits: fill `kitId, quantity`.
 */
function buildOrderDetails(cartItems: CartItem[]): CreateOrderDetailRequest[] {
  let details: CreateOrderDetailRequest[] = [];

  for (const item of cartItems) {
    if (item.type === "product" && item.product) {
      details.push({
        productId: item.product.id,
        quantity: item.quantity,
        productPriceEspecialId: item.selectedPriceId, // si aplica
      });
    } else if (item.type === "kit" && item.kit) {
      details.push({
        kitId: item.kit.id,
        quantity: item.quantity,
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
    orderDate: Date.now(), // por ejemplo
    totalPrice,
    orderDetail,
  };

  return request;
}
