import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useCurrentRestaurantQuery, useSaveRestaurantMutation, type RestaurantSettings } from "@/entities/restaurant";
import { useEmployeesQuery, useChangeEmployeeRoleMutation, useSetEmployeeBlockedMutation } from "@/entities/employee";
import { useInvitationsQuery, useCreateInvitationMutation, useRevokeInvitationMutation, useDeleteInvitationMutation, type Invitation, type InvitationRole } from "@/entities/invitation";
import { useApproveUserMutation, type EmployeeRole } from "@/entities/auth";
import { selectUser, type UserRole } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import { apiErrorMessage } from "@/shared/lib/api-error";

export function useAdminPanel() {
  const user = useAppSelector(selectUser);
  const restaurantQuery = useCurrentRestaurantQuery(undefined, { refetchOnMountOrArgChange: true });
  const employeesQuery = useEmployeesQuery(undefined, { refetchOnMountOrArgChange: true });
  const invitationsQuery = useInvitationsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [draftOverride, setDraft] = useState<RestaurantSettings | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, EmployeeRole>>({});
  const [latestInvitation, setLatestInvitation] = useState<Invitation | null>(null);
  const [save, saving] = useSaveRestaurantMutation();
  const [change, changing] = useChangeEmployeeRoleMutation();
  const [block, blocking] = useSetEmployeeBlockedMutation();
  const [approve, approving] = useApproveUserMutation();
  const [create, creating] = useCreateInvitationMutation();
  const [revoke, revoking] = useRevokeInvitationMutation();
  const [remove, removing] = useDeleteInvitationMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const execute = async (action: () => Promise<unknown>, message: string) => {
    setActionError(null);
    try {
      await action();
      notifications.show({ title: "Готово", message, color: "green" });
      return true;
    } catch (error) {
      setActionError(apiErrorMessage(error, "Не удалось выполнить действие. Попробуйте ещё раз."));
      return false;
    }
  };
  const employees = employeesQuery.data ?? [];
  const draft = draftOverride ?? restaurantQuery.data ?? { id: "", name: "", address: "", email: "", phone: "" };
  return {
    restaurantQuery, employeesQuery, invitationsQuery, actionError,
    restaurant: restaurantQuery.data, restaurantId: user.restaurantId ? String(user.restaurantId) : "", draft, setDraft,
    saveRestaurant: () => {
      const body = Object.fromEntries((["name", "address", "email", "phone"] as const)
        .map(key => [key, draft[key].trim()])
        .filter(([key, value]) => value !== restaurantQuery.data?.[key as keyof RestaurantSettings]));
      if (!Object.keys(body).length) return Promise.resolve(true);
      return execute(async () => {
        const saved = await save(body).unwrap();
        setDraft(saved);
      }, "Настройки заведения обновлены");
    },
    resetRestaurant: () => setDraft(null),
    saving: saving.isLoading,
    employees: employees.map(employee => employee.status === "pending" ? { ...employee, role: pendingRoles[employee.id] ?? "WAITER" } : employee),
    employeeBusy: changing.isLoading || blocking.isLoading || approving.isLoading,
    changeRole: (id: string, role: UserRole) => {
      if (role === "WAIT_CONFIRM") return;
      if (employees.find(employee => employee.id === id)?.status === "pending") {
        if (role === "ADMIN") return;
        setPendingRoles(current => ({ ...current, [id]: role }));
      } else void execute(() => change({ id, role }).unwrap(), "Роль сотрудника изменена");
    },
    toggleBlock: (id: string) => execute(() => block({ id, blocked: employees.find(item => item.id === id)?.status !== "blocked" }).unwrap(), "Статус сотрудника обновлён"),
    approveEmployee: (id: string) => execute(() => approve({ id: Number(id), role: pendingRoles[id] ?? "WAITER" }).unwrap(), "Доступ сотрудника одобрен"),
    invitations: invitationsQuery.data ?? [], latestInvitation,
    invitationBusy: creating.isLoading || revoking.isLoading || removing.isLoading,
    createInvitation: (role: InvitationRole, hours: number) => execute(async () => {
      setLatestInvitation(await create({ role, hours }).unwrap());
    }, "Приглашение создано"),
    revokeInvitation: (id: string) => execute(async () => {
      await revoke(id).unwrap();
      setLatestInvitation(current => current?.id === id ? { ...current, revoked: true } : current);
    }, "Приглашение отключено"),
    deleteInvitation: (id: string) => execute(async () => {
      await remove(id).unwrap();
      setLatestInvitation(current => current?.id === id ? null : current);
    }, "Приглашение удалено"),
  };
}
