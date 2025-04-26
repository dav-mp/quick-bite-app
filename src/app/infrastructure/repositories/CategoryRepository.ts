// src/app/infrastructure/repositories/CategoryRepository.ts

import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category } from "../../domain/models/category/Category";
import { categoryListAdapter } from "../../application/adapters/CategoryAdapter";
import { axiosInstance } from "../api/axionInstance";

export class CategoryRepository implements ICategoryRepository {

  /**
   * Llama a POST /api/category/getAll
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const resp = await axiosInstance.post("/api/category/getAll");
      return categoryListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Llama a POST /api/category/getCategoriesActive
   */
  async getCategoriesActive(): Promise<Category[]> {
    try {
      const resp = await axiosInstance.post("/api/category/getCategoriesActive");
      return categoryListAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

}
