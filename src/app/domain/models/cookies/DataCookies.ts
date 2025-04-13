export enum UserType {
    USER = "user",
    RESTAURANT = "restaurant",
}

export enum DataCookies {
    REFRESHTOKEN = "refresh_token",
    ACCESSTOKEN = "access_token",
    USERNAME = "username",
    EMAIL = "email",
}

// Fusionamos un namespace con el enum para agregar la propiedad USERTYPE
export namespace DataCookies {
    export const USERTYPE = UserType;
}

