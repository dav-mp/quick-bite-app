// src/app/infrastructure/repositories/ProductRepository.ts

import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { productListAdapter } from "../../application/adapters/ProductAdapter";
import { axiosInstance } from "../api/axionInstance";
import { Product } from "../../domain/models/product/Product";

export class ProductRepository implements IProductRepository {

  /**
   * Llama a POST /api/products/getAll
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const resp = await axiosInstance.post("/api/product/getAll");
      return productListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Llama a POST /api/products/getProductsActive
   */
  async getProductsActive(): Promise<Product[]> {
    try {
      const resp = await axiosInstance.post("/api/product/getProductsActive");
      console.log(resp);
      
      return productListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

}
