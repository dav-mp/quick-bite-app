import { User } from "../../domain/models/User";

/**
 * Adaptador que mapea los datos "raw" (tal como vienen del backend, 
 * ejemplo: la respuesta JSON de Supabase) a nuestro modelo de dominio `User`.
 *
 * NOTA:
 * - Supabase normalmente devuelve algo así:
 *   {
 *     user: { ... },
 *     session: {
 *       access_token: "...",
 *       refresh_token: "...",
 *       user: {...}
 *     }
 *   }
 *
 * En este ejemplo, del JSON solo necesitamos:
 *   - email  -> session.user.email
 *   - fullName  -> session.user.user_metadata.displayName
 *   - accessToken -> session.access_token
 *   - refreshToken -> session.refresh_token
 */
export function userAdapter(rawData: any): User {
  return {
    email: rawData?.session?.user?.email || "",
    fullName: rawData?.session?.user?.user_metadata?.displayName || "",
    accessToken: rawData?.session?.access_token || "",
    refreshToken: rawData?.session?.refresh_token || ""
  };
}
