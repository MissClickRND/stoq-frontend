const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
});

export const formatPrice = (value: string) =>
  currencyFormatter.format(Number(value));
