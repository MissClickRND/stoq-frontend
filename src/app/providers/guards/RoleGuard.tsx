import { canAccessPath, roleHome, selectUser } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RoleGuard() {
  const user = useAppSelector(selectUser);
  const { pathname } = useLocation();
  if (!canAccessPath(user.role, pathname)) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
}
