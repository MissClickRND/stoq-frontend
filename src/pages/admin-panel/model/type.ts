import type { UserRole } from "@/entities/user";

export type AdminTab = "establishment" | "employees" | "invitations";
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
export type RestaurantSettings = {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
};
export type InvitationRole = Exclude<UserRole, "OWNER">;
export type Invitation = {
  id: string;
  role: InvitationRole;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  usedBy?: string;
};
export type InvitationStatus = "active" | "expired" | "revoked" | "used";
