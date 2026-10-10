import {
  IconBuildingStore,
  IconUsers,
  IconMail,
  IconUserPlus,
  IconClock,
  IconCrown,
} from "@tabler/icons-react";
import type { UserRole } from "@/entities/user";
import type { Employee, Invitation, RestaurantSettings } from "./type";

export const adminTabs = [
  { value: "employees", label: "Сотрудники", icon: IconUsers },
  { value: "invitations", label: "Приглашения", icon: IconMail },
  { value: "establishment", label: "Заведение", icon: IconBuildingStore },
] as const;

export const roleLabels: Record<UserRole, string> = {
  OWNER: "Управляющий",
  ADMIN: "Администратор",
  WAITER: "Официант",
  STOREKEEPER: "Кладовщик",
};
export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value,
  label,
  disabled: value === "OWNER",
}));
export const invitationRoleOptions = roleOptions.filter(
  (item) => item.value !== "OWNER",
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
export const initialRestaurant: RestaurantSettings = {
  id: "restaurant-1",
  name: "La Maison",
  city: "Москва",
  email: "admin@lamaison.ru",
  phone: "+7 (999) 123-45-67",
};
export const initialEmployees: Employee[] = [
  {
    id: "owner",
    name: "Алиса Зарева",
    email: "alisa@lamaison.ru",
    role: "OWNER",
    status: "active",
    joinedAt: "2026-08-12",
    avatarColor: "primary",
  },
  {
    id: "ivan",
    name: "Иван Петров",
    email: "ivan@lamaison.ru",
    role: "ADMIN",
    status: "active",
    joinedAt: "2026-09-03",
    avatarColor: "blue",
  },
  {
    id: "maria",
    name: "Мария Волкова",
    email: "maria@lamaison.ru",
    role: "STOREKEEPER",
    status: "active",
    joinedAt: "2026-07-21",
    avatarColor: "pink",
  },
  {
    id: "artem",
    name: "Артём Смирнов",
    email: "artem@lamaison.ru",
    role: "STOREKEEPER",
    status: "pending",
    joinedAt: null,
    avatarColor: "orange",
  },
  {
    id: "anna",
    name: "Анна Крылова",
    email: "anna@lamaison.ru",
    role: "WAITER",
    status: "active",
    joinedAt: "2026-06-18",
    avatarColor: "green",
  },
  {
    id: "dmitry",
    name: "Дмитрий Орлов",
    email: "dmitry@lamaison.ru",
    role: "WAITER",
    status: "blocked",
    previousStatus: "active",
    joinedAt: "2026-09-05",
    avatarColor: "cyan",
  },
  {
    id: "polina",
    name: "Полина Соколова",
    email: "polina@lamaison.ru",
    role: "ADMIN",
    status: "active",
    joinedAt: "2026-08-27",
    avatarColor: "violet",
  },
  {
    id: "egor",
    name: "Егор Кузнецов",
    email: "egor@lamaison.ru",
    role: "WAITER",
    status: "pending",
    joinedAt: null,
    avatarColor: "gray",
  },
];
const now = Date.now();
const date = (hours: number) => new Date(now + hours * 3600000).toISOString();
export const initialInvitations: Invitation[] = [
  {
    id: "invite-active",
    role: "WAITER",
    createdAt: date(-24),
    expiresAt: date(24),
    revoked: false,
  },
  {
    id: "invite-used",
    role: "STOREKEEPER",
    createdAt: date(-48),
    expiresAt: date(24),
    revoked: false,
    usedBy: "Мария Волкова",
  },
  {
    id: "invite-expired",
    role: "ADMIN",
    createdAt: date(-72),
    expiresAt: date(-24),
    revoked: false,
  },
];
