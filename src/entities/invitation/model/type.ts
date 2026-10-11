import type { UserRole } from "../../user/@x/invitation.ts";
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
