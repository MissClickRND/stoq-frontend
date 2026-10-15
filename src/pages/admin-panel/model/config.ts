import {
  IconBuildingStore,
  IconUsers,
  IconMail,
  IconUserPlus,
  IconClock,
  IconCrown,
} from "@tabler/icons-react";
import type { UserRole } from "@/entities/user";

export const adminTabs = [
  { value: "employees", label: "Сотрудники", icon: IconUsers },
  { value: "invitations", label: "Приглашения", icon: IconMail },
  { value: "establishment", label: "Заведение", icon: IconBuildingStore },
] as const;

export const roleLabels: Record<UserRole, string> = {
  MANAGER: "Менеджер",
  WAIT_CONFIRM: "Ожидает подтверждения",
  ADMIN: "Администратор",
  WAITER: "Официант",
  STOREKEEPER: "Кладовщик",
};
export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
  disabled: value === "ADMIN" || value === "WAIT_CONFIRM",
}));
export const invitationRoleOptions = roleOptions.filter(
  (item) => item.value !== "ADMIN" && item.value !== "WAIT_CONFIRM",
);
export const employeeStatusLabels = {
  active: { label: "Активен", color: "green" },
  pending: { label: "Ожидает", color: "yellow" },
  blocked: { label: "Заблокирован", color: "red" },
};
export const invitationStatusLabels = {
  active: { label: "Активна", color: "green" },
  expired: { label: "Истекла", color: "red" },
  revoked: { label: "Отключена", color: "gray" },
  used: { label: "Использована", color: "blue" },
};
export const adminStatistics = [
  {
    key: "employees",
    title: "Всего сотрудников",
    description: "Все сотрудники заведения",
    icon: IconUsers,
    color: "#0d5e24",
  },
  {
    key: "invitations",
    title: "Приглашения отправлены",
    description: "Создано ссылок приглашения",
    icon: IconClock,
    color: "#bcbf0d",
  },
  {
    key: "requests",
    title: "Запросили доступ",
    description: "Ожидают одобрения",
    icon: IconUserPlus,
    color: "#a15d10",
  },
  {
    key: "admins",
    title: "Администраторов",
    description: "С правами администратора",
    icon: IconCrown,
    color: "#5a0dbf",
  },
] as const;

export const employeeColumns = [
  "Сотрудник",
  "Email",
  "Статус",
  "Дата вступления",
  "Изменение роли",
  "Действия",
];
export const invitationColumns = [
  "Ссылка / код",
  "Роль",
  "Создана",
  "Действует до",
  "Статус",
  "Действия",
];
export const invitationDurationOptions = [
  { value: "12", label: "12 часов" },
  { value: "24", label: "24 часа" },
  { value: "48", label: "48 часов" },
  { value: "168", label: "7 дней" },
];
export const initialInvitationForm = { role: "WAITER" as const, hours: "48" };
export const invitationSteps = [
  {
    title: "Создайте ссылку",
    description: "Выберите роль и срок действия приглашения.",
  },
  {
    title: "Передайте сотруднику",
    description: "Скопируйте ссылку и отправьте её удобным способом.",
  },
  {
    title: "Сотрудник запрашивает доступ",
    description:
      "По ссылке открывается регистрация, после ввода данных сотрудник сразу попадает в систему.",
  },
];
