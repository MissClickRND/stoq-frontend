import type { Invitation, InvitationStatus } from "./type";

export function invitationStatus(
  invitation: Invitation,
  now = Date.now(),
): InvitationStatus {
  if (invitation.revoked) return "revoked";
  if (invitation.usedBy) return "used";
  return Date.parse(invitation.expiresAt) <= now ? "expired" : "active";
}
export const invitationUrl = (id: string, restaurantId: string) =>
  `${window.location.origin}/register/employee?restaurantId=${encodeURIComponent(restaurantId)}&invitation=${encodeURIComponent(id)}`;
export const formatDate = (date: string | null, includeTime = false) =>
  date
    ? new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(new Date(date))
    : "—";
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
