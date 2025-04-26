// src/app/domain/repositories/IProductRepository.ts

import { Product } from "../models/product/Product";

export interface IProductRepository {
  getAllProducts(): Promise<Product[]>;
  getProductsActive(): Promise<Product[]>;
}
