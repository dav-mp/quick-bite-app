// shift.model.ts
export interface Shift {
    /** Identificador único del turno */
    id: string;
    /** FK al restaurante */
    restaurantId: string;
    /** Fecha y hora de apertura (ISO 8601) */
    openShift: string;
    /** Fecha y hora de cierre (ISO 8601). Ausente si el turno sigue abierto */
    closeShift?: string;
}