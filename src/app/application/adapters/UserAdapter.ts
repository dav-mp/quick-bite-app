// src/app/application/adapters/AuthAdapter.ts

import { User } from "../../domain/models/User";

/**
 * Adaptador que mapea los datos "raw" (tal como vienen del backend)
 * a nuestro modelo de dominio `User`.
 */
export function userAdapter(rawData: any): User {
  return {
    id: rawData.id || "",
    name: rawData.name || "",
    email: rawData.email || "",
    // Dependiendo de cómo el backend devuelva la información de roles
    role: Array.isArray(rawData.role) ? rawData.role : [],
  };
}
