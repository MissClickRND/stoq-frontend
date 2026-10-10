import { selectUser } from "@/entities/user/model/userSelectors";
import { useAppSelector } from "@/shared/lib";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function RoleGuard({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (user.id === undefined) return;

    if (!roles.includes(user.role)) {
      navigate("/");
    }
  }, [user.id, user.role]);

  return children;
}
