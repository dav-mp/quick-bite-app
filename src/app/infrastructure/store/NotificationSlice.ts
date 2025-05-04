// src/app/infrastructure/store/NotificationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { StatusOrder } from "../../domain/models/oreder/Order"
import { RootState } from "./Store"

// ➊ la propiedad `type` ya no es necesaria
export interface OrderStatusUpdate {
  orderId: string
  status: StatusOrder
  restaurantName?: string
  timestamp: string          // ← la seguimos generando en el cliente
}

interface NotificationState {
  notifications: OrderStatusUpdate[]
  updatedOrderIds: string[]
}

const initialState: NotificationState = {
  notifications: [],
  updatedOrderIds: [],
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<OrderStatusUpdate>) => {
      state.notifications.push(action.payload)
      if (!state.updatedOrderIds.includes(action.payload.orderId)) {
        state.updatedOrderIds.push(action.payload.orderId)
      }
    },
    markOrderAsViewed: (state, action: PayloadAction<string>) => {
        state.updatedOrderIds = state.updatedOrderIds.filter((id) => id !== action.payload)
    },
    clearNotifications: (state) => {
        state.notifications = []
        state.updatedOrderIds = []
    },
},
})

export const {
  addNotification,
  markOrderAsViewed,
  clearNotifications,
} = notificationSlice.actions
export const selectNotifications = (state: RootState) => state.notifications.notifications
export const selectUpdatedOrderIds = (state: RootState) => state.notifications.updatedOrderIds
export const selectHasUpdates = (orderId: string) => (state: RootState) =>
  state.notifications.updatedOrderIds.includes(orderId)
export const selectNotificationsForOrder = (orderId: string) => (state: RootState) =>
  state.notifications.notifications.filter((notification) => notification.orderId === orderId)

/* … selectores igual … */
export default notificationSlice.reducer
