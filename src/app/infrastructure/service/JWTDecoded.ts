import { jwtDecode } from 'jwt-decode';
import { DataCookies } from '../../domain/models/cookies/DataCookies';
import { getDataCookies } from './CookiesService';

export const JWTDecoded = <T>(jwt: string): T => {
  return jwtDecode<T>(jwt);
}

export const getJWTDataDecoded = <T>(): T => {
    const token = getDataCookies( DataCookies.ACCESSTOKEN )
    return JWTDecoded( token! )
}