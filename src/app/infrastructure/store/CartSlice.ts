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
 * Estado inicial para el slice del carrito.
 */
interface CartState {
  items: CartItem[];
}

/**
 * Función auxiliar para cargar el carrito desde localStorage.
 */
function loadCartFromLocalStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error("Error loading cart from localStorage", err);
  }
  return [];
}

/**
 * Función auxiliar para guardar el carrito en localStorage.
 */
function saveCartToLocalStorage(items: CartItem[]) {
  try {
    localStorage.setItem("cartItems", JSON.stringify(items));
  } catch (err) {
    console.error("Error saving cart to localStorage", err);
  }
}

const initialState: CartState = {
  items: loadCartFromLocalStorage(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Agrega un producto individual al carrito.
     * Podemos fusionar "agregar producto" y "agregar kit" en una sola acción,
     * pero aquí lo separamos para mayor claridad.
     */
    addProductToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        selectedPriceId?: string; // por si el usuario elige un precio específico
      }>
    ) => {
      const { product, quantity = 1, selectedPriceId } = action.payload;

      // Ver si ya existe este mismo producto + variant en el carrito
      const existingItem = state.items.find(
        (item) =>
          item.type === "product" &&
          item.product?.id === product.id &&
          item.selectedPriceId === selectedPriceId
      );
      if (existingItem) {
        // Actualizamos la cantidad
        existingItem.quantity += quantity;
      } else {
        // Creamos un nuevo item en el carrito
        state.items.push({
          id: crypto.randomUUID(), // o usa alguna librería como uuid
          type: "product",
          product,
          quantity,
          selectedPriceId,
        });
      }

      saveCartToLocalStorage(state.items);
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

      // Ver si ya existe este mismo kit en el carrito
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

      saveCartToLocalStorage(state.items);
    },

    /**
     * Eliminar un ítem por su 'id' interno de carrito.
     */
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      state.items = newItems;
      saveCartToLocalStorage(state.items);
    },

    /**
     * Vaciar todo el carrito
     */
    clearCart: (state) => {
      state.items = [];
      saveCartToLocalStorage(state.items);
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
      saveCartToLocalStorage(state.items);
    },
  },
});

export const {
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

export default cartSlice.reducer;
