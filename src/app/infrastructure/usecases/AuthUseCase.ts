// src/app/infrastructure/usecases/AuthUseCase.ts

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { User } from "../../domain/models/User";

export class AuthUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async register(
    name: string,
    email: string,
    password: string,
    age: number,
    address: string,
    phone: string,
    userName?: string
  ): Promise<User> {
    // Validaciones mínimas
    if (!name || !email || !password || !age || !address || !phone) {
      throw new Error("Datos incompletos para registro");
    }

    return await this.authRepo.registerUser(
      name,
      email,
      password,
      age,
      address,
      phone,
      userName
    );
  }

  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error("Datos inválidos para login");
    }
    return await this.authRepo.loginUser(email, password);
  }

  // Otros métodos que necesites (logout, refreshToken, etc)...
}
