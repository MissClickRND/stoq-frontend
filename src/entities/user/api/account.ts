import { useAppSelector } from "@/shared/lib/store";
import { roleLabels } from "../model/access";
import { selectUser } from "../model/userSelectors";
export function useAccount() {
  const user = useAppSelector(selectUser);
  const name = user.fullName ?? user.email ?? "";
  return { account: user.id && user.role ? {
    name, role: roleLabels[user.role],
    initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase(),
  } : null };
}
