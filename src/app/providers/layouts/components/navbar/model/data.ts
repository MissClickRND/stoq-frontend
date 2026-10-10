import {
  IconChartBar,
  IconChefHat,
  IconFileText,
  IconLogout,
  IconPackage,
  IconSettings,
  IconShieldCog,
  IconShoppingCart,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { NavbarAction, NavbarUser, NavigationItem } from "./type";

export const navigationItems: NavigationItem[] = [
  { label: "Дашборд", path: "/dashboard", icon: IconChartBar },
  { label: "Склад", path: "/store", icon: IconPackage },
  { label: "Поставки", path: "/supply", icon: IconTruckDelivery },
  { label: "Заказы", path: "/orders", icon: IconShoppingCart },
  { label: "Блюда", path: "/dishes", icon: IconChefHat },
  { label: "Логи", path: "/logs", icon: IconFileText },
  { label: "Админ-панель", path: "/admin-panel", icon: IconShieldCog },
];

export const navbarUser: NavbarUser | null = {
  initials: "АЗ",
  name: "Пользователь",
  role: "Администратор",
};

export const navbarActions: NavbarAction[] = [
  { label: "Настройки", icon: IconSettings },
  { label: "Выйти", icon: IconLogout },
];

export const navbarLogo = {
  alt: "STOQ",
  src: "/main-logo.svg",
};
