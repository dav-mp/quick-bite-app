/**
 * Modelo de dominio para Usuario.
 * Solo contiene los campos que solicitaste:
 *  - email
 *  - fullName
 *  - accessToken
 *  - refreshToken
 */
export interface User {
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}
