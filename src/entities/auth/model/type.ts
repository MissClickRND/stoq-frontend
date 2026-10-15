import type { SessionUser } from "../../user/@x/auth.ts";
export type { LoginRequest as ILoginRequest, EmployeeRegistrationRequest as IRegisterRequest } from "./requests.ts";
export type AuthResponse = { user: SessionUser };
export type IStatusResponse = AuthResponse & { authenticated: boolean };
export type RegistrationResponse = { message: string; user: Pick<SessionUser, "id" | "email" | "role" | "restaurantId"> };
export type RestaurantResponse = { id: number; name: string; address: string; email?: string | null; phone?: string | null };
export type PendingUser = { id: number; fullName: string; email: string; createdAt: string };
export type EmployeeRole = "MANAGER" | "WAITER" | "STOREKEEPER";
