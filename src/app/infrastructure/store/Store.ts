// src/app/infrastructure/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./CartSlice";

/**
 * Creamos el store de Redux con nuestro cartSlice.
 * Aquí puedes añadir más slices si tu aplicación lo requiere.
 */
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    // ... otros slices
  },
  // middleware, devTools, etc...
});

// Tipo raíz del estado Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
