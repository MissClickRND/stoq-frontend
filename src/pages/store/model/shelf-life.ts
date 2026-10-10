const dayInMilliseconds = 86_400_000;
const calendarFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Moscow",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function getShelfLifeDays(
  shelfLife: string,
  now = new Date(),
): number | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(shelfLife);
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  const expiry = new Date(Date.UTC(year, month - 1, day));
  if (
    expiry.getUTCFullYear() !== year ||
    expiry.getUTCMonth() !== month - 1 ||
    expiry.getUTCDate() !== day
  )
    return null;

  const parts = calendarFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value);
  const today = Date.UTC(part("year"), part("month") - 1, part("day"));
  return (expiry.getTime() - today) / dayInMilliseconds;
}

export function formatShelfLifeDays(days: number): string {
  const value = Math.abs(days);
  const lastTwo = value % 100;
  const last = value % 10;
  const word =
    lastTwo >= 11 && lastTwo <= 14
      ? "дней"
      : last === 1
        ? "день"
        : last >= 2 && last <= 4
          ? "дня"
          : "дней";
  if (days === 0) return "Истекает сегодня";
  return days < 0 ? `Просрочен на ${value} ${word}` : `${value} ${word}`;
}
