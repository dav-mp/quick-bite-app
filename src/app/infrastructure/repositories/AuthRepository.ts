// src/app/infrastructure/repositories/AuthRepository.ts

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { User } from "../../domain/models/User";
import { userAdapter } from "../../application/adapters/UserAdapter";
import { axiosInstance } from "../api/axionInstance";

export class AuthRepository implements IAuthRepository {
  /**
   * POST /api/auth/user/register
   * Body: { name, email, password, age, address, phone, userName? }
   */
  async registerUser(
    name: string,
    email: string,
    password: string,
    age: number,
    address: string,
    phone: string,
    userName?: string
  ): Promise<User> {
    try {
      const resp = await axiosInstance.post("/api/auth/user/register", {
        name,
        email,
        password,
        age,
        address,
        phone,
        userName,
      });
      return userAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  /**
   * Tu backend actual NO maneja confirmación de usuario (no existe /userConfirm),
   * podrías eliminar este método o dejarlo comentado si planeas implementarlo en el futuro.
   */
  // async confirmUser(email: string, code: string): Promise<any> {
  //   // NO EXISTE en tu backend actual
  //   throw new Error("No se implementó /api/auth/userConfirm en el backend.");
  // }

  /**
   * POST /api/auth/user/login
   * Body: { email, password }
   */
  async loginUser(email: string, password: string): Promise<User> {
    try {
      const resp = await axiosInstance.post("/api/auth/user/login", { email, password });
      return userAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}
