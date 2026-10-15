import { baseApi } from "@/shared/api";
import type { LoginRequest, EmployeeRegistrationRequest, RestaurantRegistrationRequest } from "../model/requests.ts";
import type { AuthResponse, IStatusResponse, RegistrationResponse, RestaurantResponse, PendingUser, EmployeeRole } from "../model/type.ts";

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    register: build.mutation<RegistrationResponse, EmployeeRegistrationRequest>({
      query: body => ({ url: "/auth/register-user", method: "POST", body }),
    }),
    registerRestaurant: build.mutation<RegistrationResponse & { restaurant: RestaurantResponse }, RestaurantRegistrationRequest>({
      query: body => ({ url: "/auth/register-restaurant", method: "POST", body }),
    }),
    login: build.mutation<AuthResponse, LoginRequest>({
      query: body => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: build.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    status: build.query<IStatusResponse, void>({
      query: () => "/auth/status",
      providesTags: [{ type: "User", id: "SESSION" }],
    }),
    pendingUsers: build.query<PendingUser[], void>({
      query: () => "/auth/admin/users/pending",
      providesTags: [{ type: "User", id: "PENDING" }],
    }),
    approveUser: build.mutation<unknown, { id: number; role: EmployeeRole }>({
      query: ({ id, role }) => ({ url: "/auth/admin/users/" + id + "/approve", method: "PATCH", body: { role } }),
      invalidatesTags: [{ type: "User", id: "PENDING" }],
    }),
    deleteEmployee: build.mutation<{ message: string }, number>({
      query: id => ({ url: "/auth/admin/users/" + id, method: "DELETE" }),
      invalidatesTags: [{ type: "User", id: "PENDING" }],
    }),
    updateRestaurant: build.mutation<RestaurantResponse, Partial<Pick<RestaurantResponse, "name" | "address" | "email" | "phone">>>({
      query: body => ({ url: "/auth/admin/restaurant", method: "PATCH", body }),
    }),
  }),
});
export const { useRegisterMutation, useRegisterRestaurantMutation, useLoginMutation, useLogoutMutation,
  useStatusQuery, usePendingUsersQuery, useApproveUserMutation, useDeleteEmployeeMutation, useUpdateRestaurantMutation } = authApi;
