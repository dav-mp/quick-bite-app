// src/app/domain/models/User.ts

/**
 * Modelo de dominio para Usuario.
 */
export interface User {
    id: string;
    name: string;
    email: string;
    role: string[]; 
  }
  