import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { sessionExpired, sessionReceived } from "@/shared/lib/session-events";
import { getApiBaseUrl } from "./connection";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  timeout: 20000,
});
type Query = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
let refreshing: Promise<Awaited<ReturnType<typeof baseQuery>>> | undefined;
const publicAuth = new Set(["/auth/login", "/auth/register-user", "/auth/register-restaurant"]);
export const baseQueryWithReauth: Query = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const guest = typeof args !== "string" && args.credentials === "omit";
  const publicLogin = publicAuth.has(url) || /^\/test\/restaurants\/\d+\/login$/.test(url);
  // Cookie-changing logins must finish after any rotation of the previous session.
  if (refreshing && !guest) await refreshing;
  let result = await baseQuery(args, api, extraOptions);
  if (result.error?.status !== 401 || publicLogin || guest) return result;
  if (url === "/auth/refresh") {
    api.dispatch(sessionExpired());
    return result;
  }
  if (!refreshing) {
    // One query being cancelled must not abort the shared cookie rotation.
    refreshing = Promise.resolve(baseQuery({ url: "/auth/refresh", method: "POST" },
      { ...api, signal: new AbortController().signal }, extraOptions)).then(refresh => {
      if (refresh.data && typeof refresh.data === "object" && "user" in refresh.data) {
        api.dispatch(sessionReceived(refresh.data.user as ReturnType<typeof sessionReceived>["payload"]));
      } else if (refresh.error?.status === 401 || refresh.error?.status === 403) {
        api.dispatch(sessionExpired());
      }
      return refresh;
    }).finally(() => { refreshing = undefined; });
  }
  const refresh = await refreshing;
  if (refresh.data) {
    result = await baseQuery(args, api, extraOptions);
    if (result.error?.status === 401) api.dispatch(sessionExpired());
  } else if (refresh.error && refresh.error.status !== 401 && refresh.error.status !== 403) {
    return refresh;
  }
  return result;
};
