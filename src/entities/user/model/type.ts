export type UserRole = "ADMIN" | "CUSTOMER" | "COOK" | "WAITER";

export interface Allergen {
  id: number;
  name: string;
}

export interface IUserState {
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
