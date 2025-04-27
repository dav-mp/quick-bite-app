// src/app/domain/repositories/IKitRepository.ts

import { Kit } from "../models/kit/Kit";

export interface IKitRepository {
  /**
   * Obtiene todos los kits (sin detalle de productos).
   */
  getAllKits(): Promise<Kit[]>;

  /**
   * Obtiene todos los kits con el detalle de sus productos.
   */
  getAllKitsWithProducts(): Promise<Kit[]>;
}
