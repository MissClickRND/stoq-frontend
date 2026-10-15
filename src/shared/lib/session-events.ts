import { createAction } from "@reduxjs/toolkit";

// The transport emits an event; entity reducers decide how to clear their state.
export const sessionExpired = createAction("session/expired");
export const sessionReceived = createAction<{
  id: number; fullName: string; email: string;
  role: "ADMIN" | "MANAGER" | "WAITER" | "STOREKEEPER" | "WAIT_CONFIRM";
  restaurantId: number;
}>("session/received");
// A new login also clears data belonging to the previous account/restaurant.
export const sessionStarted = createAction<ReturnType<typeof sessionReceived>["payload"]>("session/started");
