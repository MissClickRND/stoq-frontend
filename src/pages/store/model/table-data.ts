export const tableColumns = [
  "ID поставки",
  "Продукт / артикул",
  "Остаток",
  "Ед. измерения",
  "Полная цена",
  "Срок годности",
  "Статус",
  "Действия",
];

export const productStatuses: Record<string, { label: string; color: string }> =
  {
    normal: { label: "В норме", color: "green" },
    end: { label: "Заканчивается", color: "yellow" },
    "soon-expired": { label: "Скоро испортится", color: "orange" },
    expired: { label: "Просрочен", color: "red" },
  };

export const writeOffText = {
  title: "Списание продукта",
  confirm: "Списать продукт",
  cancel: "Отмена",
  warning: "Продукт ещё не испорчен. Списание удалит его остаток со склада.",
};

export const productDetailFields = [
  { key: "article", label: "Артикул" },
  { key: "supplyId", label: "ID поставки" },
  { key: "shelfLife", label: "Срок годности" },
  { key: "remains", label: "Остаток" },
  { key: "price", label: "Цена за единицу" },
  { key: "totalPrice", label: "Итоговая цена" },
] as const;
