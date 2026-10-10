import { baseApi } from "@/shared/api";
import {
  ILoginRequest,
  IRegisterRequest,
  IStatusResponse,
} from "../model/type";
import { IUserState } from "@/entities/user";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<IUserState, IRegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: {
          email: data.email,
          password: data.password,
        },
      }),
    }),

    login: build.mutation<IUserState, ILoginRequest>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    status: build.query<IStatusResponse, void>({
      query: () => "/auth/status",
      providesTags: [{ type: "User" }],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useStatusQuery,
} = authApi;
