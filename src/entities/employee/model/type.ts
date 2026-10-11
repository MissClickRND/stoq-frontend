import type { UserRole } from "../../user/@x/employee.ts";
export type EmployeeStatus = "active" | "pending" | "blocked";
export type Employee = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: EmployeeStatus;
  joinedAt: string | null;
  avatarColor: string;
  previousStatus?: Exclude<EmployeeStatus, "blocked">;
};
