// src/app/infrastructure/usecases/CategoryUseCase.ts

import { Category } from "../../domain/models/category/Category";
import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";

export class CategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.repository.getAllCategories();
  }

  async getCategoriesActive(): Promise<Category[]> {
    return this.repository.getCategoriesActive();
  }
}
