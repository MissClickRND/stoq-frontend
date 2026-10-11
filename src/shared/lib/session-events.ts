import { createAction } from "@reduxjs/toolkit";

// The transport emits an event; entity reducers decide how to clear their state.
export const sessionExpired = createAction("session/expired");
