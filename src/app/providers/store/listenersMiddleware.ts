import {
  createListenerMiddleware,
  isAnyOf,
  type TypedStartListening,
} from "@reduxjs/toolkit";
import { authApi } from "@/entities/auth";
import { userLogout } from "@/entities/user";
import { baseApi } from "@/shared/api";
import { sessionExpired, sessionStarted, sessionReceived } from "@/shared/lib/session-events";
import { inventoryDraftActions } from "@/features/inventory";
import dayjs from "dayjs";

export const listenerMiddleware = createListenerMiddleware();
export const startAppListening =
  listenerMiddleware.startListening as TypedStartListening<
    RootState,
    AppDispatch
  >;

export function registerListeners() {
  startAppListening({
    matcher: isAnyOf(sessionExpired, sessionStarted, userLogout, authApi.endpoints.logout.matchFulfilled, authApi.endpoints.login.matchFulfilled),
    effect: (_action, api) => {
      for (const request of api.dispatch(baseApi.util.getRunningQueriesThunk())) request.abort();
      api.dispatch(baseApi.util.resetApiState());
      api.dispatch(inventoryDraftActions.reset(dayjs().format("YYYY-MM-DD")));
    },
  });
  startAppListening({
    matcher: isAnyOf(sessionReceived, authApi.endpoints.status.matchFulfilled),
    effect: (_action, api) => {
      const previous = api.getOriginalState().user;
      const current = api.getState().user;
      if (previous.id === undefined || (previous.id === current.id &&
        previous.restaurantId === current.restaurantId && previous.role === current.role)) return;
      for (const request of api.dispatch(baseApi.util.getRunningQueriesThunk())) request.abort();
      api.dispatch(baseApi.util.resetApiState());
      api.dispatch(inventoryDraftActions.reset(dayjs().format("YYYY-MM-DD")));
    },
  });
}
