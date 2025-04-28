// src/app/infrastructure/store/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../domain/models/product/Product";
import { Kit } from "../../domain/models/kit/Kit";
import { RootState } from "./Store";

/**
 * Representa un ítem en el carrito.
 * 'type' indica si es un 'product' o un 'kit'.
 * - selectedPriceId se usa para identificar el precio/variante elegida del producto.
 */
export interface CartItem {
  id: string;                  // ID interno (podrías usar un uuid)
  type: "product" | "kit";
  product?: Product;           // si type="product"
  kit?: Kit;                   // si type="kit"
  quantity: number;            // cantidad del item
  selectedPriceId?: string;    // ID del precio especial/variante
}

/**
 * Estado del carrito, incluyendo el `restaurantId` seleccionado.
 */
interface CartState {
  items: CartItem[];
  restaurantId: string | null;
}

/**
 * Estructura a guardar en localStorage para persistir todo el estado del carrito.
 */
interface CartPersistedData {
  items: CartItem[];
  restaurantId: string | null;
}

/**
 * Función auxiliar para cargar el estado completo del carrito (items + restaurantId) desde localStorage.
 */
function loadCartStateFromLocalStorage(): CartState {
  try {
    const stored = localStorage.getItem("cartState");
    if (stored) {
      const parsed: CartPersistedData = JSON.parse(stored);
      return {
        items: parsed.items || [],
        restaurantId: parsed.restaurantId || null,
      };
    }
  } catch (err) {
    console.error("Error loading cart from localStorage", err);
  }
  return { items: [], restaurantId: null };
}

/**
 * Guarda el estado completo del carrito (items + restaurantId) en localStorage.
 */
function saveCartStateToLocalStorage(state: CartState) {
  try {
    const dataToStore: CartPersistedData = {
      items: state.items,
      restaurantId: state.restaurantId,
    };
    localStorage.setItem("cartState", JSON.stringify(dataToStore));
  } catch (err) {
    console.error("Error saving cart to localStorage", err);
  }
}

const initialState: CartState = loadCartStateFromLocalStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Fija el ID del restaurante al cual pertenecen los productos del carrito.
     */
    setRestaurantId: (state, action: PayloadAction<string | null>) => {
      state.restaurantId = action.payload;
      saveCartStateToLocalStorage(state);
    },

    /**
     * Agrega un producto individual al carrito.
     */
    addProductToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        selectedPriceId?: string;
      }>
    ) => {
      const { product, quantity = 1, selectedPriceId } = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item.type === "product" &&
          item.product?.id === product.id &&
          item.selectedPriceId === selectedPriceId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: crypto.randomUUID(),
          type: "product",
          product,
          quantity,
          selectedPriceId,
        });
      }

      saveCartStateToLocalStorage(state);
    },

    /**
     * Agrega un kit al carrito
     */
    addKitToCart: (
      state,
      action: PayloadAction<{
        kit: Kit;
        quantity?: number;
      }>
    ) => {
      const { kit, quantity = 1 } = action.payload;

      const existingItem = state.items.find(
        (item) => item.type === "kit" && item.kit?.id === kit.id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: crypto.randomUUID(),
          type: "kit",
          kit,
          quantity,
        });
      }

      saveCartStateToLocalStorage(state);
    },

    /**
     * Eliminar un ítem por su 'id' interno de carrito.
     */
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      state.items = newItems;
      saveCartStateToLocalStorage(state);
    },

    /**
     * Vaciar todo el carrito (ej. al cambiar de restaurante).
     */
    clearCart: (state) => {
      state.items = [];
      saveCartStateToLocalStorage(state);
    },

    /**
     * Actualizar manualmente la cantidad de un ítem
     */
    updateItemQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) => {
      const { cartItemId, quantity } = action.payload;
      const itemToUpdate = state.items.find((item) => item.id === cartItemId);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
      }
      saveCartStateToLocalStorage(state);
    },
  },
});

export const {
  setRestaurantId,
  addProductToCart,
  addKitToCart,
  removeItemFromCart,
  clearCart,
  updateItemQuantity,
} = cartSlice.actions;

/**
 * Selector para obtener los items del carrito.
 */
export const selectCartItems = (state: RootState) => state.cart.items;

/**
 * Selector para obtener el ID del restaurante en el carrito.
 */
export const selectRestaurantId = (state: RootState) => state.cart.restaurantId;

export default cartSlice.reducer;
