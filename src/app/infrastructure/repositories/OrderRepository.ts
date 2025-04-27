// ===========================================================
// File: src/app/infrastructure/repositories/OrderRepository.ts
// ===========================================================

import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import {
  ChangeStatusOrderRequest,
  CreateOrderRequest,
  GetAllOrdersByCustomerRequest,
  GetOrdersByRestaurantRequest,
  TransformedOrder
} from "../../domain/models/oreder/Order";
import { orderAdapter, orderListAdapter } from "../../application/adapters/OrderAdapter";
import { axiosInstance } from "../api/axionInstance";

export class OrderRepository implements IOrderRepository {

  async createOrder(data: CreateOrderRequest): Promise<TransformedOrder> {
    try {
      // Ejemplo de llamada POST al backend:
      // El endpoint de tu backend (en el ejemplo: /api/order/user/createOrder)
      const resp = await axiosInstance.post("/api/order/user/createOrder", data);
      // El backend retorna algo como { data: newOrder, ... }
      // Podrías adaptar la respuesta con orderAdapter si lo necesitas:
      return orderAdapter(resp.data.data); 
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getAllOrdersByCustomerId(data: GetAllOrdersByCustomerRequest): Promise<TransformedOrder[]> {
    try {
      const resp = await axiosInstance.post("/api/order/user/getAllOrdersByCustomerId", data);
      // Suponiendo que el backend retorna un array con las órdenes transformadas:
      return orderListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getActiveOrders(data: GetOrdersByRestaurantRequest): Promise<TransformedOrder[]> {
    try {
      const resp = await axiosInstance.post("/api/order/restaurant/getActiveOrders", data);
      return orderListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getAllOrdersRestaurant(data: GetOrdersByRestaurantRequest): Promise<TransformedOrder[]> {
    try {
      // Tu backend tiene un endpoint similar (por ejemplo /restaurant/geAllOrders),
      // pero en el backend se ve un error tipográfico. Ajusta según tu ruta real:
      const resp = await axiosInstance.post("/api/order/restaurant/geAllOrders", data);
      return orderListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async changeStatusOrder(data: ChangeStatusOrderRequest): Promise<TransformedOrder> {
    try {
      const resp = await axiosInstance.post("/api/order/restaurant/changeStatusOrder", data);
      return orderAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

}
