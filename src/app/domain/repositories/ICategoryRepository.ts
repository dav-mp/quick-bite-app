// src/app/domain/repositories/ICategoryRepository.ts

import { Category } from "../models/category/Category";

export interface ICategoryRepository {
  getAllCategories(): Promise<Category[]>;
  getCategoriesActive(): Promise<Category[]>;
}
