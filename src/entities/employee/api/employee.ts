import { baseApi } from "@/shared/api";
import type { UserRole } from "../../user/@x/employee.ts";
import type { Employee, EmployeeStatus } from "../model/type.ts";

export type EmployeeResponse = {
  id: number; fullName: string; email: string; role: UserRole;
  status: EmployeeStatus; createdAt: string;
};
export const toEmployee = (employee: EmployeeResponse): Employee => ({
  id: String(employee.id), name: employee.fullName, email: employee.email,
  role: employee.role, status: employee.status, joinedAt: employee.createdAt,
  avatarColor: "secondary",
});
export const employeesApi = baseApi.injectEndpoints({
  endpoints: build => ({
    employees: build.query<Employee[], void>({
      query: () => "/auth/admin/users",
      transformResponse: (response: EmployeeResponse[]) => response.map(toEmployee),
      providesTags: [{ type: "User", id: "EMPLOYEES" }],
    }),
    changeEmployeeRole: build.mutation<unknown, { id: string; role: Exclude<UserRole, "WAIT_CONFIRM"> }>({
      query: ({ id, role }) => ({ url: `/auth/admin/users/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: [{ type: "User", id: "EMPLOYEES" }],
    }),
    setEmployeeBlocked: build.mutation<unknown, { id: string; blocked: boolean }>({
      query: ({ id, blocked }) => ({ url: `/auth/admin/users/${id}/block`, method: "PATCH", body: { blocked } }),
      invalidatesTags: [{ type: "User", id: "EMPLOYEES" }],
    }),
  }),
});
export const { useEmployeesQuery, useChangeEmployeeRoleMutation, useSetEmployeeBlockedMutation } = employeesApi;
