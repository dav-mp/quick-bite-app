// ===========================================================
// File: src/app/infrastructure/usecases/OrderUseCase.ts
// ===========================================================

import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import {
  ChangeStatusOrderRequest,
  CreateOrderRequest,
  GetAllOrdersByCustomerRequest,
  GetOrdersByRestaurantRequest,
  TransformedOrder,
} from "../../domain/models/oreder/Order";

export class OrderUseCase {

  constructor(private readonly orderRepo: IOrderRepository) {}

  async createOrder(data: CreateOrderRequest): Promise<TransformedOrder> {
    if (!data.customerId || !data.restaurantId) {
      throw new Error("Faltan datos obligatorios para crear la orden");
    }
    return this.orderRepo.createOrder(data);
  }

  async getAllOrdersByCustomerId(data: GetAllOrdersByCustomerRequest): Promise<TransformedOrder[]> {
    if (!data.customerId) {
      throw new Error("Se requiere customerId");
    }
    return this.orderRepo.getAllOrdersByCustomerId(data);
  }

  async getActiveOrders(data: GetOrdersByRestaurantRequest): Promise<TransformedOrder[]> {
    if (!data.restaurantId) {
      throw new Error("Se requiere restaurantId");
    }
    return this.orderRepo.getActiveOrders(data);
  }

  async getAllOrdersRestaurant(data: GetOrdersByRestaurantRequest): Promise<TransformedOrder[]> {
    if (!data.restaurantId) {
      throw new Error("Se requiere restaurantId");
    }
    return this.orderRepo.getAllOrdersRestaurant(data);
  }

  async changeStatusOrder(data: ChangeStatusOrderRequest): Promise<TransformedOrder> {
    if (!data.orderId || !data.restaurantId) {
      throw new Error("Faltan IDs para cambiar el estado de la orden");
    }
    return this.orderRepo.changeStatusOrder(data);
  }

}
