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

export const writeOffText = {
  title: "Списание продукта",
  confirm: "Списать продукт",
  cancel: "Отмена",
  warning: "Продукт ещё не испорчен. Списание обнулит его остаток на складе.",
};

export const productDetailFields = [
  { key: "article", label: "Артикул" },
  { key: "supplyId", label: "ID поставки" },
  { key: "shelfLife", label: "Срок годности" },
  { key: "remains", label: "Остаток" },
  { key: "price", label: "Цена за единицу" },
  { key: "totalPrice", label: "Итоговая цена" },
] as const;
