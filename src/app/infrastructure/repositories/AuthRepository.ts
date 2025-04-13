// src/app/infrastructure/repositories/AuthRepository.ts

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { User } from "../../domain/models/User";
import { userAdapter } from "../../application/adapters/UserAdapter";
import { axiosInstance } from "../api/axionInstance";

  

export class AuthRepository implements IAuthRepository {

  /**
   * Recibe todos los campos que tu backend requiere.
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
      const resp = await axiosInstance.post("/api/authuser/register", {
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

  async confirmUser(email: string, code: string): Promise<any> {
    try {
      const resp = await axiosInstance.post("/api/authuser/userConfirm", {
        email,
        confirmationCode: code
      });
      // Aquí podrías retornar un `User` si el backend lo retorna,
      // o simplemente `resp.data` si devuelve un objeto genérico
      return resp.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async loginUser(email: string, password: string): Promise<User> {
    try {
      const resp = await axiosInstance.post("/api/authuser/login", {
        email, 
        password 
      });
      console.log(resp);
      
      // Adaptamos la respuesta a un User de dominio
      return userAdapter(resp.data);
    } catch (error: any) {
      console.log(error);
      
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}
