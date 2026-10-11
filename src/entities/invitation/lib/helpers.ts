import { getPublicSiteOrigin } from "../../../shared/lib/site-origin.ts";
import type { Invitation, InvitationStatus } from "../model/type.ts";

export function invitationStatus(
  invitation: Invitation,
  now = Date.now(),
): InvitationStatus {
  if (invitation.revoked) return "revoked";
  if (invitation.usedBy) return "used";
  return Date.parse(invitation.expiresAt) <= now ? "expired" : "active";
}
export const invitationUrl = (id: string, restaurantId: string) =>
  `${getPublicSiteOrigin()}/register/employee?restaurantId=${encodeURIComponent(restaurantId)}&invitation=${encodeURIComponent(id)}`;
