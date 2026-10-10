import { baseApi } from "@/shared/api";
import {
  IUpdateProfileData,
  IUpdateRoleUser,
  IUsersListQuery,
  IUsersListResponse,
  IUserState,
} from "../model/type";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<IUserState, void>({
      query: () => "/users/profile",
      providesTags: [{ type: "User", id: "PROFILE" }],
    }),

    getUsers: build.query<IUsersListResponse, IUsersListQuery>({
      query: (params) => ({ url: "/users", params }),
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...rest } = queryArgs;
        return rest;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        currentCache.data.push(...newItems.data);
        currentCache.meta = newItems.meta;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              { type: "User" as const, id: "LIST" },
              ...result.data.map((user) => ({
                type: "User" as const,
                id: user.id,
              })),
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    updateRoleUser: build.mutation<IUserState, IUpdateRoleUser>({
      query: (data) => ({
        url: "/users/role",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateProfile: build.mutation<IUserState, IUpdateProfileData>({
      query: (data) => ({
        url: "/users/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetUsersQuery,
  useUpdateProfileMutation,
  useUpdateRoleUserMutation,
} = userApi;
