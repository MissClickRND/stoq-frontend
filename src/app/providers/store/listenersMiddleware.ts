import {
  createListenerMiddleware,
  isAnyOf,
  type TypedStartListening,
} from "@reduxjs/toolkit";
import { authApi } from "@/entities/auth";
import { userLogout } from "@/entities/user";
import { baseApi } from "@/shared/api";
import { sessionExpired } from "@/shared/lib/session-events";
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
    matcher: isAnyOf(sessionExpired, userLogout, authApi.endpoints.logout.matchFulfilled, authApi.endpoints.login.matchFulfilled),
    effect: (_action, api) => {
      for (const request of api.dispatch(baseApi.util.getRunningQueriesThunk())) request.abort();
      api.dispatch(baseApi.util.resetApiState());
      api.dispatch(inventoryDraftActions.reset(dayjs().format("YYYY-MM-DD")));
    },
  });
}
