// src/app/infrastructure/DI/KitContainer.ts

import { KitRepository } from "../repositories/KitRepository";
import { KitUseCase } from "../usecases/KitUseCase";

// 1) Instanciamos el repositorio
const kitRepository = new KitRepository();

// 2) Inyectamos el repositorio al caso de uso
export const kitUseCase = new KitUseCase(kitRepository);
