import {
  IconSoup,
  IconCheck,
  IconPlayerPauseFilled,
  IconPackageOff,
  IconShoppingCart,
  IconChartBar,
  IconCrown,
  IconPackage,
  IconTopologyStar3,
  type TablerIcon,
} from "@tabler/icons-react";
import type { DishPriority } from "@/entities/dish";

export const dishModes: { value: DishMode; label: string; icon: TablerIcon }[] =
  [
    { value: "all", label: "Все блюда", icon: IconSoup },
    { value: "stop", label: "Стоп-лист", icon: IconPlayerPauseFilled },
    { value: "recommended", label: "Горячие предложения", icon: IconCrown },
    { value: "graph", label: "Граф связей", icon: IconTopologyStar3 },
  ];

export const dishColumns = {
  all: [
    "Название и описание",
    "Категория",
    "Цена",
    "Осталось порций",
    "Статус",
    "Ингредиентов",
    "Действия",
  ],
  stop: [
    "Название",
    "Цена",
    "Осталось порций",
    "Причина недоступности",
    "Отсутствует ингредиентов",
    "Статус",
    "Действия",
  ],
  recommended: [
    "Название и описание",
    "Цена и выручка",
    "Наценка",
    "Статус",
    "Причина рекомендации",
    "Приоритет",
    "Действия",
  ],
};

export const dishStatisticItems = [
  {
    key: "total",
    title: "Всего блюд",
    description: "Находятся в меню",
    icon: IconSoup,
    color: "#0d5e24",
  },
  {
    key: "active",
    title: "Активные блюда",
    description: "Готовы к продаже",
    icon: IconCheck,
    color: "#0f8c14",
  },

  {
    key: "missing",
    title: "Не хватает ингредиентов",
    description: "Нуждаются в пополнении",
    icon: IconPackageOff,
    color: "#a15d10",
  },
  {
    key: "stopped",
    title: "В стоп-листе",
    description: "Временно недоступны",
    icon: IconPlayerPauseFilled,
    color: "#730a17",
  },
] as const;

export const priorityLabels: Record<
  DishPriority,
  { label: string; color: string; rank: number }
> = {
  high: { label: "Высокий приоритет", color: "red", rank: 0 },
  medium: { label: "Средний приоритет", color: "orange", rank: 1 },
  low: { label: "Низкий", color: "green", rank: 2 },
};

export const detailStatisticItems = [
  {
    key: "today",
    title: "Продано сегодня",
    icon: IconShoppingCart,
    color: "primary",
  },
  {
    key: "week",
    title: "Продано за неделю",
    icon: IconChartBar,
    color: "green",
  },
  {
    key: "popularity",
    title: "Популярность по продажам",
    icon: IconCrown,
    color: "orange",
  },
  {
    key: "stock",
    title: "Остатки ингредиентов",
    icon: IconPackage,
    color: "secondary",
  },
] as const;

import type { DishMode } from "./type";
