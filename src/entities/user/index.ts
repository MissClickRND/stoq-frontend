export {
  userLogout,
  setUser,
  userReducer,
  userSlice,
} from "./model/userSlice.ts";
export {
  useGetProfileQuery,
  useGetUsersQuery,
  useUpdateProfileMutation,
  useUpdateRoleUserMutation,
} from "./api/userApi.ts";
export type * from "./model/type.ts";

export { useAccount } from "./api/account.ts";
export { selectUser } from "./model/userSelectors";
