// src/app/infrastructure/DI/AuthContainer.ts

import { AuthRepository } from "../repositories/AuthRepository";
import { AuthUseCase } from "../usecases/AuthUseCase";

// 1) Instanciamos el repositorio
const authRepository = new AuthRepository();

// 2) Inyectamos el repositorio al caso de uso
export const authUseCase = new AuthUseCase(authRepository);
