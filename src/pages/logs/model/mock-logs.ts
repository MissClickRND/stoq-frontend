export type LogAction = "create" | "update" | "delete" | "role" | "invite" | "automatic";

export interface LogEntry {
  id: string;
  action: LogAction;
  author: { name: string; role: string };
  category: string;
  title: string;
  description: string;
  timestamp: string;
  dateLabel: string;
  time: string;
  change?: { before: string; after: string };
  object?: string;
  detail?: string;
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const alice = { name: "Алиса Завеса", role: "Администратор" };
const ivan = { name: "Иван Петров", role: "Кладовщик" };
const maria = { name: "Мария Волкова", role: "Менеджер" };

type MockEntry = Omit<LogEntry, "timestamp" | "dateLabel">;

function withDate(date: Date, entries: MockEntry[]): LogEntry[] {
  return entries.map((entry) => {
    const [hours, minutes] = entry.time.split(":").map(Number);
    const timestamp = new Date(date);
    timestamp.setHours(hours, minutes, 0, 0);
    return {
      ...entry,
      timestamp: timestamp.toISOString(),
      dateLabel: date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
    };
  });
}

export const logGroups = [
  {
    id: "today",
    label: `Сегодня, ${today.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`,
    entries: withDate(today, [
      {
        id: "restaurant-renamed", action: "update", author: alice, category: "Заведение", time: "14:32",
        title: "Изменила название заведения",
        description: "Обновлено название ресторана в настройках заведения.",
        change: { before: "Ресторан Ромашка", after: "Ромашка Prime" },
      },
      {
        id: "stock-updated", action: "update", author: ivan, category: "Склад", time: "13:15",
        title: "Обновил остаток продукта",
        description: "Скорректировано количество продукта «Моцарелла» на складе.",
        change: { before: "12 кг", after: "9 кг" },
      },
      {
        id: "employee-role", action: "role", author: maria, category: "Сотрудники", time: "11:48",
        title: "Изменила роль сотрудника",
        description: "Обновлены права доступа сотрудника Анны Крыловой.",
        change: { before: "Официант", after: "Менеджер" },
      },
      {
        id: "invitation-created", action: "invite", author: { name: "Артём Смирнов", role: "Администратор" },
        category: "Приглашения", time: "10:21", title: "Создал ссылку-приглашение",
        description: "Создано приглашение для нового сотрудника. Срок действия — 48 часов.",
        object: "Роль: повар", detail: "Одноразовое приглашение в заведение",
      },
      {
        id: "supply-deleted", action: "delete", author: { name: "Егор Кузнецов", role: "Менеджер" },
        category: "Поставки", time: "09:17", title: "Удалил поставку",
        description: "Удалена ошибочно созданная поставка от ООО «ВкусПлюс».",
        object: "Поставка № 5482", detail: "Поставщик: ООО «ВкусПлюс»",
      },
      {
        id: "stock-written-off", action: "automatic", author: { name: "Система", role: "Автоматическое действие" },
        category: "Склад", time: "08:03", title: "Списана просроченная партия",
        description: "Истёк срок годности партии продукта «Томаты черри».",
        object: "Томаты черри · 1,5 кг", detail: "Причина: истёк срок годности",
      },
    ]),
  },
  {
    id: "yesterday",
    label: `Вчера, ${yesterday.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`,
    entries: withDate(yesterday, [
      {
        id: "dish-created", action: "create", author: maria, category: "Блюда", time: "18:42",
        title: "Добавила новое блюдо",
        description: "В меню добавлено блюдо с рецептом и стоимостью.",
        object: "Салат с томатами и страчателлой", detail: "Категория: салаты · Цена: 590 ₽",
      },
      {
        id: "supply-created", action: "create", author: ivan, category: "Поставки", time: "15:06",
        title: "Принял поставку",
        description: "Продукты из поставки оприходованы на склад.",
        object: "Поставка № 5481", detail: "ООО «Свежие продукты» · 8 позиций",
      },
      {
        id: "dish-price-updated", action: "update", author: alice, category: "Блюда", time: "12:30",
        title: "Изменила стоимость блюда",
        description: "Обновлена цена блюда «Паста с креветками» в меню.",
        change: { before: "690 ₽", after: "750 ₽" },
      },
    ]),
  },
];
