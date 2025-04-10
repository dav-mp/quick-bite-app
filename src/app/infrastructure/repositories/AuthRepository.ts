// src/app/infrastructure/repositories/AuthRepository.ts

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { User } from "../../domain/models/User";
import { userAdapter } from "../../application/adapters/UserAdapter";
import axios from "axios";


export const axiosInstance = axios.create({
    // baseURL: 'https://t2orimport.meta.env.xjhjd3.execute-api.us-east-1.amazonaws.com', // Aquí pondrías tu endpoint real
    baseURL: "https://quickbite-apiauthuser.onrender.com/api/auth", // Aquí pondrías tu endpoint real
});
  

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
      const resp = await axiosInstance.post("/register", {
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
      const resp = await axiosInstance.post("/userConfirm", {
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
      const resp = await axiosInstance.post("/login", {
        email, 
        password 
      });
      // Adaptamos la respuesta a un User de dominio
      return userAdapter(resp.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
}
