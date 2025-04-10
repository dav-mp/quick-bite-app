// src/app/domain/repositories/IAuthRepository.ts

import { User } from "../models/User";

/**
 * Interfaz del repositorio para autenticación.
 */
export interface IAuthRepository {
  /**
   * Registra un nuevo usuario con email y password.
   * Retorna el modelo de dominio de usuario creado.
   */
  registerUser(    name: string,
    email: string,
    password: string,
    age: number,
    address: string,
    phone: string,
    userName?: string): Promise<User>;

  /**
   * Confirma un usuario (puedes utilizar, por ejemplo, un código).
   */
  confirmUser(email: string, code: string): Promise<any>;

  /**
   * Inicia sesión con email y password.
   * Retorna el usuario logueado (o token, etc. según tu necesidad).
   */
  loginUser(email: string, password: string): Promise<User>;

  /**
   * Otros métodos que necesites, como logout, refreshToken, etc.
   */
}
