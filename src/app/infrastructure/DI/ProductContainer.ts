// src/app/infrastructure/DI/ProductContainer.ts

import { ProductRepository } from "../repositories/ProductRepository";
import { ProductUseCase } from "../usecases/ProductUseCase";

// 1) Instanciamos el repositorio
const productRepository = new ProductRepository();

// 2) Inyectamos el repositorio al caso de uso
export const productUseCase = new ProductUseCase(productRepository);
