export { userLogout, setUser, userReducer, userSlice } from "./model/userSlice";
export {
  useGetProfileQuery,
  useGetUsersQuery,
  useUpdateProfileMutation,
  useUpdateRoleUserMutation,
} from "./api/userApi";
export type { IUserState, UserRole } from "./model/type";
