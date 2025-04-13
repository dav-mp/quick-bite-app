// cookieService.ts
import Cookies from 'js-cookie';
import { DataCookies, UserType,  } from '../../domain/models/cookies/DataCookies';

// Establece los tokens en cookies con opciones de seguridad para producción
export const setDataCookies = ( name: DataCookies | UserType, data: string, expires: number = 7 ): void => {
  Cookies.set( name, data, {
    expires: expires, // La cookie expira en 7 días
    secure: true,
    sameSite: 'strict', // Evita envío en solicitudes de terceros
  })
};

// Obtiene el JWT desde las cookies
export const getDataCookies = ( name: DataCookies | UserType ): string | undefined => {
  return Cookies.get(name);
};

export const removeDataCookies = ( name: DataCookies ) => {
  Cookies.remove( name )
}

// Elimina ambos tokens de las cookies
export const removeUserCookies = (): void => {
  Cookies.remove(DataCookies.ACCESSTOKEN);
  Cookies.remove(DataCookies.REFRESHTOKEN);
  Cookies.remove(DataCookies.EMAIL);
  Cookies.remove(DataCookies.USERNAME);
};