const dayInMilliseconds = 86_400_000;

export function getShelfLifeColor(days: number | null): string {
  if (days === null) return "gray";
  if (days <= 1) return "red";
  if (days < 3) return "orange";
  if (days < 7) return "yellow";
  return "green";
}

function parseShelfLife(value: string): Date | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (match) {
    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 && date.getDate() === day
      ? date
      : null;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function getShelfLifeDays(
  shelfLife: string,
  now = new Date(),
): number | null {
  const expiry = parseShelfLife(shelfLife);
  if (!expiry) return null;
  // Compare local calendar dates; UTC arithmetic avoids daylight-saving offsets.
  const dateOnly = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return (dateOnly(expiry) - dateOnly(now)) / dayInMilliseconds;
}

export function formatShelfLifeDate(shelfLife: string): string {
  const expiry = parseShelfLife(shelfLife);
  if (!expiry) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(expiry);
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
