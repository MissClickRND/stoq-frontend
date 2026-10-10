import {
  IconChartBar,
  IconChefHat,
  IconMoon,
  IconFileText,
  IconLogout,
  IconPackage,
  IconSettings,
  IconShieldCog,
  IconSun,
  IconShoppingCart,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { ColorSchemeOption, NavbarAction, NavbarUser, NavigationItem } from "./type";

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
  { label: "Выйти", icon: IconLogout },
];

export const navbarSettings = {
  label: "Настройки",
  colorSchemeLabel: "Цветовая схема",
  icon: IconSettings,
};

export const colorSchemeOptions: ColorSchemeOption[] = [
  { label: "Светлая", value: "light", icon: IconSun },
  { label: "Тёмная", value: "dark", icon: IconMoon },
];

export const navbarLogo = {
  alt: "STOQ",
  src: "/main-logo.svg",
};
