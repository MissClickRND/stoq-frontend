import { sessionExpired, sessionReceived, sessionStarted } from "@/shared/lib/session-events";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../auth/@x/user.ts";
import type { IUserState, SessionUser } from "./type.ts";
import { staffRoles } from "./access.ts";

const initialState: IUserState = { userAllergens: [], sessionStatus: "unknown", sessionRevision: 0 };
const anonymous: IUserState = { ...initialState, sessionStatus: "anonymous" };
function fromSession(user: SessionUser, previous: IUserState, rotated = false): IUserState {
  if (!staffRoles.includes(user.role)) return anonymous;
  const changed = rotated || previous.id !== user.id || previous.role !== user.role;
  return { ...initialState, ...user, name: user.fullName, sessionStatus: "authenticated",
    sessionRevision: (previous.sessionRevision ?? 0) + Number(changed) };
}
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SessionUser>) => fromSession(action.payload, state),
    userLogout: () => anonymous,
  },
  extraReducers: builder => {
    builder.addCase(sessionExpired, () => anonymous);
    builder.addCase(sessionReceived, (state, action) => fromSession(action.payload, state, true));
    builder.addCase(sessionStarted, (state, action) => fromSession(action.payload, state, true));
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => fromSession(action.payload.user, state, true));
    builder.addMatcher(authApi.endpoints.status.matchFulfilled, (state, action) => action.payload.authenticated ? fromSession(action.payload.user, state) : anonymous);
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, () => anonymous);
  },
});
export const { setUser, userLogout } = userSlice.actions;
export const userReducer = userSlice.reducer;
