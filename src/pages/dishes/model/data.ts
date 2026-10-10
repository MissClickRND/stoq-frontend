import {
  IconSoup,
  IconCheck,
  IconPlayerPauseFilled,
  IconPackageOff,
  IconShoppingCart,
  IconChartBar,
  IconCrown,
  IconPackage,
} from "@tabler/icons-react";
import type { Dish, DishIngredient, DishMode, DishPriority } from "./type";
import type { TablerIcon } from "@tabler/icons-react";

export const dishModes: { value: DishMode; label: string; icon: TablerIcon }[] =
  [
    { value: "all", label: "Все блюда", icon: IconSoup },
    { value: "stop", label: "Стоп-лист", icon: IconPlayerPauseFilled },
    { value: "recommended", label: "Горячие предложения", icon: IconCrown },
  ];

export const dishColumns = {
  all: ["Название и описание", "Цена", "Статус", "Ингредиентов", "Действия"],
  stop: [
    "Название и описание",
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
    color: "#13a118",
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
  high: { label: "Продать сегодня", color: "red", rank: 0 },
  medium: { label: "Средний приоритет", color: "orange", rank: 1 },
  low: { label: "Рекомендуется", color: "green", rank: 2 },
};

export const dishFormDefaults = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  stopped: false,
  stopReason: "",
  ingredients: [] as DishIngredient[],
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

const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const ingredientCatalog: DishIngredient[] = [
  {
    id: "salmon",
    name: "Лосось атлантический",
    unit: "кг",
    quantity: 0.2,
    stock: 2.4,
    costPerUnit: 1600,
    expiresOn: dateOffset(2),
  },
  {
    id: "asparagus",
    name: "Спаржа",
    unit: "кг",
    quantity: 0.08,
    stock: 1.2,
    costPerUnit: 650,
    expiresOn: dateOffset(4),
  },
  {
    id: "tomatoes",
    name: "Помидоры черри",
    unit: "кг",
    quantity: 0.06,
    stock: 0.3,
    costPerUnit: 300,
    expiresOn: dateOffset(2),
  },
  {
    id: "lemon",
    name: "Лимон",
    unit: "кг",
    quantity: 0.03,
    stock: 1.1,
    costPerUnit: 200,
    expiresOn: dateOffset(10),
  },
  {
    id: "oil",
    name: "Оливковое масло",
    unit: "л",
    quantity: 0.02,
    stock: 0.5,
    costPerUnit: 700,
    expiresOn: dateOffset(60),
  },
  {
    id: "shrimp",
    name: "Креветки",
    unit: "кг",
    quantity: 0.15,
    stock: 1.4,
    costPerUnit: 1100,
    expiresOn: dateOffset(3),
  },
  {
    id: "salad",
    name: "Салат романо",
    unit: "кг",
    quantity: 0.1,
    stock: 1.8,
    costPerUnit: 250,
    expiresOn: dateOffset(3),
  },
  {
    id: "parmesan",
    name: "Пармезан",
    unit: "кг",
    quantity: 0.025,
    stock: 0.7,
    costPerUnit: 1400,
    expiresOn: dateOffset(15),
  },
  {
    id: "pasta",
    name: "Паста",
    unit: "кг",
    quantity: 0.12,
    stock: 3.5,
    costPerUnit: 250,
    expiresOn: dateOffset(90),
  },
  {
    id: "bacon",
    name: "Бекон",
    unit: "кг",
    quantity: 0.06,
    stock: 0.8,
    costPerUnit: 700,
    expiresOn: dateOffset(2),
  },
  {
    id: "egg",
    name: "Яйцо",
    unit: "шт.",
    quantity: 1,
    stock: 24,
    costPerUnit: 15,
    expiresOn: dateOffset(10),
  },
  {
    id: "cheese",
    name: "Творожный сыр",
    unit: "кг",
    quantity: 0.12,
    stock: 0,
    costPerUnit: 600,
    expiresOn: dateOffset(5),
  },
  {
    id: "berries",
    name: "Ягоды",
    unit: "кг",
    quantity: 0.05,
    stock: 0.6,
    costPerUnit: 900,
    expiresOn: dateOffset(2),
  },
  {
    id: "beef",
    name: "Говядина",
    unit: "кг",
    quantity: 0.18,
    stock: 2.2,
    costPerUnit: 850,
    expiresOn: dateOffset(-1),
  },
  {
    id: "bun",
    name: "Булочка",
    unit: "шт.",
    quantity: 1,
    stock: 20,
    costPerUnit: 30,
    expiresOn: dateOffset(3),
  },
  {
    id: "chocolate",
    name: "Шоколад",
    unit: "кг",
    quantity: 0.07,
    stock: 0,
    costPerUnit: 1200,
    expiresOn: dateOffset(30),
  },
];

const recipe = (...ids: string[]) =>
  ids.map((id) => ({ ...ingredientCatalog.find((item) => item.id === id)! }));
const sales = (counts: number[]) =>
  counts.map((quantity, index) => ({
    date: dateOffset(index - counts.length + 1),
    quantity,
  }));

export const mockDishImage =
  "https://i.pinimg.com/originals/f6/8c/02/f68c022de85632efc2a1bad16d4f042f.jpg";

export const initialDishes: Dish[] = [
  {
    id: "salmon-steak",
    imageUrl: mockDishImage,
    name: "Стейк из лосося",
    description:
      "Нежный стейк из атлантического лосося с овощами гриль и лимонным соусом.",
    price: 1490,
    stopped: false,
    ingredients: recipe("salmon", "asparagus", "tomatoes", "lemon", "oil"),
    recommendation: {
      reason: "Лосось и помидоры черри с близким сроком годности",
      priority: "high",
    },
    sales: sales([8, 12, 15, 10, 18, 14, 12]),
  },
  {
    id: "caesar",
    imageUrl: mockDishImage,
    name: "Салат «Цезарь» с креветками",
    description:
      "Классический салат с тигровыми креветками, романо и пармезаном.",
    price: 790,
    stopped: false,
    ingredients: recipe("shrimp", "salad", "parmesan", "oil"),
    recommendation: {
      reason: "Большой остаток креветок и салата на складе",
      priority: "high",
    },
    sales: sales([6, 7, 10, 12, 9, 11, 8]),
  },
  {
    id: "carbonara",
    imageUrl: mockDishImage,
    name: "Паста «Карбонара»",
    description: "Итальянская паста с беконом, яйцом и пармезаном.",
    price: 690,
    stopped: false,
    ingredients: recipe("pasta", "bacon", "egg", "parmesan"),
    recommendation: {
      reason: "Бекон с близким сроком годности",
      priority: "high",
    },
    sales: sales([12, 15, 13, 18, 16, 14, 10]),
  },
  {
    id: "cheesecake",
    imageUrl: mockDishImage,
    name: "Чизкейк с ягодами",
    description: "Сливочный чизкейк с сезонными ягодами.",
    price: 450,
    stopped: true,
    stopReason: "Закончился творожный сыр",
    ingredients: recipe("cheese", "berries", "egg"),
    sales: sales([5, 8, 4, 3, 0, 0, 0]),
  },
  {
    id: "burger",
    imageUrl: mockDishImage,
    name: "Бургер с говядиной",
    description: "Сочная говяжья котлета, свежие овощи и фирменный соус.",
    price: 890,
    stopped: true,
    stopReason: "Истёк срок годности говядины",
    ingredients: recipe("beef", "bun", "tomatoes", "salad"),
    sales: sales([8, 10, 7, 12, 9, 5, 0]),
  },
  {
    id: "fondant",
    imageUrl: mockDishImage,
    name: "Шоколадный фондан",
    description: "Тёплый шоколадный десерт с нежной начинкой.",
    price: 520,
    stopped: true,
    stopReason: "Нет шоколада",
    ingredients: recipe("chocolate", "egg"),
    sales: sales([4, 6, 5, 8, 3, 0, 0]),
  },
  {
    id: "vegetable-pasta",
    imageUrl: mockDishImage,
    name: "Паста с овощами",
    description: "Паста со спаржей, черри и оливковым маслом.",
    price: 590,
    stopped: false,
    ingredients: recipe("pasta", "asparagus", "tomatoes", "oil"),
    recommendation: {
      reason: "Высокая прибыль с порции и остатки овощей",
      priority: "medium",
    },
    sales: sales([3, 5, 7, 4, 9, 8, 6]),
  },
];
