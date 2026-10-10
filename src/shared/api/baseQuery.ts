import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { userLogout } from "@/entities/user/model/userSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000",
  credentials: "include",
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // если это refresh → не пытаемся обновлять токен
    if (typeof args === "string" && args.includes("/auth/refresh")) {
      api.dispatch(userLogout());
      return result;
    }

    if (typeof args !== "string" && args.url.includes("/auth/refresh")) {
      api.dispatch(userLogout());
      return result;
    }

    // пробуем refresh
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // повторяем исходный запрос
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(userLogout());
    }
  }

  return result;
};
