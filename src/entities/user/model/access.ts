import type { UserRole } from "./type.ts";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Администратор", MANAGER: "Менеджер", WAITER: "Официант",
  STOREKEEPER: "Кладовщик", WAIT_CONFIRM: "Ожидает подтверждения",
};
export const fullAccessRoles: UserRole[] = ["ADMIN", "MANAGER"];
export const dishRoles: UserRole[] = [...fullAccessRoles, "WAITER"];
export const staffRoles: UserRole[] = [...dishRoles, "STOREKEEPER"];
const sections: Record<string, UserRole[]> = {
  analytics: fullAccessRoles, dashboard: fullAccessRoles, orders: dishRoles,
  logs: fullAccessRoles, "menu-hints": fullAccessRoles,
  dishes: dishRoles, store: staffRoles, supply: staffRoles,
  "admin-panel": ["ADMIN"], test: ["ADMIN"],
};
export function canAccessPath(role: string | undefined, pathname: string): boolean {
  if (pathname === "/analytics/dependencies") return Boolean(role && dishRoles.includes(role as UserRole));
  return Boolean(role && sections[pathname.split("/")[1]]?.includes(role as UserRole));
}
export function roleHome(role?: UserRole): string {
  if (role === "ADMIN" || role === "MANAGER") return "/analytics/dashboard";
  if (role === "WAITER") return "/dishes";
  if (role === "STOREKEEPER") return "/store";
  return "/login";
}
