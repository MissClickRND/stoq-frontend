export type UserRole = "ADMIN" | "MANAGER" | "WAITER" | "STOREKEEPER" | "WAIT_CONFIRM";

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  restaurantId: number;
}

export interface Allergen {
  id: number;
  name: string;
}

export interface IUserState {
  sessionStatus?: "unknown" | "authenticated" | "anonymous";
  sessionRevision?: number;
  fullName?: string;
  restaurantId?: number;
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  userAllergens?: Allergen[];
}

export interface IUpdateProfileData extends Pick<
  IUserState,
  "email" | "name" | "phone"
> {
  userAllergenIds: number[];
}

export interface IUsersListQuery {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface IUsersListResponse {
  data: IUserState[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IUpdateRoleUser {
  userId: number;
  role: UserRole;
}
