// ===========================================================
// File: src/app/infrastructure/DI/OrderContainer.ts
// ===========================================================

import { OrderRepository } from "../repositories/OrderRepository";
import { OrderUseCase } from "../usecases/OrderUseCase";

// 1) Instanciamos el repositorio
const orderRepository = new OrderRepository();

// 2) Inyectamos el repositorio al caso de uso
export const orderUseCase = new OrderUseCase(orderRepository);
