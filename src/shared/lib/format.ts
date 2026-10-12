export const formatCurrency = (
  value: number,
  maximumFractionDigits = 2,
  minimumFractionDigits = 0,
) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

export const formatDate = (date: string | null, includeTime = false) =>
  date
    ? new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(new Date(date))
    : "—";

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

export function normalizeArticle(id: number | string | null | undefined): string {
  if (id === null || id === undefined) return "—";
  const value = String(id).trim();
  return /^\d+$/.test(value) ? value.padStart(5, "0") : "—";
}
