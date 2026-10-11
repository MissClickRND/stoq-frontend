export const statusPresentation = {
  available: {
    color: "#58b83d",
    label: "Достаточно",
    dishLabel: "Доступно к приготовлению",
  },
  low_stock: {
    color: "#f5a524",
    label: "Заканчивается",
    dishLabel: "Ингредиент заканчивается",
  },
  unavailable: {
    color: "#f05262",
    label: "Недостаточно",
    dishLabel: "Недоступно к приготовлению",
  },
  out_of_stock: {
    color: "#f05262",
    label: "Нет в наличии",
    dishLabel: "Недоступно к приготовлению",
  },
} as const;
