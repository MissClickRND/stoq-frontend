import type { Invitation } from "./type.ts";
const now = Date.now();
const date = (hours: number) => new Date(now + hours * 3600000).toISOString();
export const mockInvitations: Invitation[] = [
  {
    id: "invite-active",
    role: "WAITER",
    createdAt: date(-24),
    expiresAt: date(24),
    revoked: false,
  },
  {
    id: "invite-used",
    role: "STOREKEEPER",
    createdAt: date(-48),
    expiresAt: date(24),
    revoked: false,
    usedBy: "Мария Волкова",
  },
  {
    id: "invite-expired",
    role: "ADMIN",
    createdAt: date(-72),
    expiresAt: date(-24),
    revoked: false,
  },
];
