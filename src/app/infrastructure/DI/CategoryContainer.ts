// src/app/infrastructure/DI/CategoryContainer.ts

import { CategoryRepository } from "../repositories/CategoryRepository";
import { CategoryUseCase } from "../usecases/CategoryUseCase";

// 1) Instanciamos el repositorio
const categoryRepository = new CategoryRepository();

// 2) Inyectamos el repositorio al caso de uso
export const categoryUseCase = new CategoryUseCase(categoryRepository);
