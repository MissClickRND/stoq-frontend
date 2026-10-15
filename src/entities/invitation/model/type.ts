import type { UserRole } from "../../user/@x/invitation.ts";
export type InvitationRole = Exclude<UserRole, "WAIT_CONFIRM">;
export type Invitation = {
  id: string;
  role: InvitationRole;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  usedAt?: string | null;
  usedBy?: string;
};
export type InvitationStatus = "active" | "expired" | "revoked" | "used";
