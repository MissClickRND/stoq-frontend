import { UserRole } from "@/entities/user/model/type";

export interface IRegisterRequest {
  email: string;
  password: string;
}

export interface ILoginRequest extends IRegisterRequest {}

interface UserStatus {
  id: number;
  email: string;
  role: UserRole;
}

export interface IStatusResponse {
  authenticated: boolean;
  user: UserStatus;
}
