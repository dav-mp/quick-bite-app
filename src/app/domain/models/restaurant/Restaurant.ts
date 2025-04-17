import { Shift } from "../shiftRestaurant/Shift";

export interface Restaurant {
    /** UUID del restaurante */
    id: string;
    /** Nombre comercial */
    name: string;
    /** Código interno del restaurante */
    resId: string;
    /** Dirección física */
    address: string;
    /** Estado activo/inactivo */
    status: boolean;
    /** Fecha de última modificación (ISO 8601) */
    updatedAt: string;
    /** Fecha de creación (ISO 8601) */
    createdAt: string;
    /** Hash de contraseña */
    password: string;
    /** URL o buffer de imagen. Null si no tiene imagen */
    image: string | null;
    /** Array de turnos */
    Shift: Shift[];
}