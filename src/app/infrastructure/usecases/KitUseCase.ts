// src/app/infrastructure/usecases/KitUseCase.ts

import { Kit } from "../../domain/models/kit/Kit";
import { IKitRepository } from "../../domain/repositories/IKitRepository";

export class KitUseCase {
  constructor(private readonly kitRepository: IKitRepository) {}

  async getAllKits(): Promise<Kit[]> {
    return await this.kitRepository.getAllKits();
  }

  async getAllKitsWithProducts(): Promise<Kit[]> {
    return await this.kitRepository.getAllKitsWithProducts();
  }
}
