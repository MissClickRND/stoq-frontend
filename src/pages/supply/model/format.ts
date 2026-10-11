import dayjs from "dayjs";

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
export const formatDateTime = (value: string) =>
  dayjs(value).format("DD.MM.YYYY · HH:mm");
