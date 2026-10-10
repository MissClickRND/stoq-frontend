import { useState } from "react";
import type { UserRole } from "@/entities/user";
import { updateMockRestaurant } from "@/shared/api/auth-mock";
import {
  initialEmployees,
  initialInvitations,
  initialRestaurant,
  invitationRoleOptions,
} from "./data";
import type { InvitationRole, RestaurantSettings } from "./type";

export function useAdminPanel() {
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [draft, setDraft] = useState<RestaurantSettings>({
    ...initialRestaurant,
  });
  const [employees, setEmployees] = useState(initialEmployees);
  const [invitations, setInvitations] = useState(initialInvitations);
  const saveRestaurant = () => {
    const settings = {
      ...draft,
      name: draft.name.trim(),
      city: draft.city.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    };
    setRestaurant(settings);
    updateMockRestaurant({
      id: settings.id,
      name: settings.name,
      city: settings.city,
    });
    setDraft(settings);
    console.info("[mock] Настройки заведения", settings);
  };
  const resetRestaurant = () => {
    setDraft({ ...restaurant });
  };

  const changeRole = (id: string, role: UserRole) => {
    if (
      role === "OWNER" ||
      employees.find((item) => item.id === id)?.role === "OWNER"
    )
      return;
    setEmployees((current) =>
      current.map((item) => (item.id === id ? { ...item, role } : item)),
    );
    console.info("[mock] Изменение роли", { employeeId: id, role });
  };
  const toggleBlock = (id: string) => {
    if (employees.find((item) => item.id === id)?.role === "OWNER") return;
    setEmployees((current) =>
      current.map((item) =>
        item.id !== id
          ? item
          : item.status === "blocked"
            ? {
                ...item,
                status: item.previousStatus ?? "active",
                previousStatus: undefined,
              }
            : { ...item, previousStatus: item.status, status: "blocked" },
      ),
    );
    console.info("[mock] Изменение блокировки", { employeeId: id });
  };
  const approveEmployee = (id: string) => {
    setEmployees((current) =>
      current.map((item) =>
        item.id === id && item.status === "pending"
          ? { ...item, status: "active", joinedAt: new Date().toISOString() }
          : item,
      ),
    );
    console.info("[mock] Одобрение доступа", { employeeId: id });
  };
  const createInvitation = (role: InvitationRole, hours: number) => {
    if (
      !invitationRoleOptions.some((item) => item.value === role) ||
      ![12, 24, 48, 168].includes(hours)
    )
      return null;
    const invitation = {
      id: crypto.randomUUID(),
      role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + hours * 3600000).toISOString(),
      revoked: false,
    };
    setInvitations((current) => [invitation, ...current]);
    console.info("[mock] Приглашение сотрудника", {
      ...invitation,
      restaurantId: restaurant.id,
    });
    return invitation;
  };
  const revokeInvitation = (id: string) => {
    setInvitations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, revoked: true } : item,
      ),
    );
    console.info("[mock] Отключение приглашения", { id });
  };
  const deleteInvitation = (id: string) => {
    setInvitations((current) => current.filter((item) => item.id !== id));
    console.info("[mock] Удаление приглашения", { id });
  };
  return {
    restaurant,
    draft,
    setDraft,
    saveRestaurant,
    resetRestaurant,
    employees,
    changeRole,
    toggleBlock,
    approveEmployee,
    invitations,
    createInvitation,
    revokeInvitation,
    deleteInvitation,
  };
}
