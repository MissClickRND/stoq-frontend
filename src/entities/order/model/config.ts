export const orderTypeOptions = [
  { value: "dine-in", label: "В зале" },
  { value: "takeaway", label: "На вынос" },
];
export const tableOptions = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `Стол ${index + 1}`,
}));
export const orderStatuses = {
  pending: { label: "Проверка остатков", color: "gray" },
  processing: { label: "В обработке", color: "orange" },
  preparing: { label: "Готовится", color: "blue" },
  completed: { label: "Выполнен", color: "green" },
  rejected: { label: "Отклонён", color: "red" },
  cancelled: { label: "Отменён", color: "gray" },
};
