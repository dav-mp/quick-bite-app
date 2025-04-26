// src/app/infrastructure/usecases/ProductUseCase.ts

import { Product } from "../../domain/models/product/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";

export class ProductUseCase {
  constructor(private readonly repository: IProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.repository.getAllProducts();
  }

  async getProductsActive(): Promise<Product[]> {
    return this.repository.getProductsActive();
  }
}
