// ===========================================================
// File: src/app/domain/repositories/IOrderRepository.ts
// ===========================================================

import {
    ChangeStatusOrderRequest,
    CreateOrderRequest,
    GetAllOrdersByCustomerRequest,
    GetOrdersByRestaurantRequest,
    TransformedOrder
  } from "../models/oreder/Order";
  
  export interface IOrderRepository {
    createOrder(data: CreateOrderRequest): Promise<TransformedOrder>;
    getAllOrdersByCustomerId(data: GetAllOrdersByCustomerRequest): Promise<TransformedOrder[]>;
    getActiveOrders(data: GetOrdersByRestaurantRequest): Promise<TransformedOrder[]>;
    getAllOrdersRestaurant(data: GetOrdersByRestaurantRequest): Promise<TransformedOrder[]>;
    changeStatusOrder(data: ChangeStatusOrderRequest): Promise<TransformedOrder>;
  }
  