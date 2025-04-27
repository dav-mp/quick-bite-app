// src/app/infrastructure/repositories/KitRepository.ts

import { IKitRepository } from "../../domain/repositories/IKitRepository";
import { kitListAdapter } from "../../application/adapters/KitAdapter";
import { axiosInstance } from "../api/axionInstance";
import { Kit } from "../../domain/models/kit/Kit";

export class KitRepository implements IKitRepository {
  
  /**
   * Llama al endpoint api/kit/getAllKits para obtener todos los kits.
   */
  async getAllKits(): Promise<Kit[]> {
    try {
      const response = await axiosInstance.post("api/kit/getAllKits");
      return kitListAdapter(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Llama al endpoint api/kit/getAllKitsWithProducts para obtener
   * todos los kits con el detalle de productos.
   */
  async getAllKitsWithProducts(): Promise<Kit[]> {
    try {
      const response = await axiosInstance.post("api/kit/getAllKitsWithProducts");
      return kitListAdapter(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}
