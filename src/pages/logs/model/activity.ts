import type { ActivityEntry } from '@/entities/activity';

export type LogEntry = ActivityEntry & { dateLabel: string; time: string };
const roles: Record<string, string> = { ADMIN: 'Администратор', MANAGER: 'Менеджер', WAITER: 'Официант',
  STOREKEEPER: 'Кладовщик', WAIT_CONFIRM: 'Ожидает подтверждения', GUEST: 'Гость', SYSTEM: 'Автоматическое действие' };
const dateFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function appendActivity(previous: ActivityEntry[], next: ActivityEntry[]): ActivityEntry[] {
  const entries = new Map(previous.map(entry => [entry.id, entry]));
  for (const entry of next) if (!entries.has(entry.id)) entries.set(entry.id, entry);
  return [...entries.values()];
}

export function groupActivity(entries: ActivityEntry[]) {
  const groups = new Map<string, { id: string; label: string; entries: LogEntry[] }>();
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    const id = dayFormat.format(date);
    const dateLabel = dateFormat.format(date);
    const group = groups.get(id) ?? { id, label: dateLabel, entries: [] };
    group.entries.push({ ...entry, author: { ...entry.author, role: roles[entry.author.role] ?? entry.author.role }, dateLabel, time: timeFormat.format(date) });
    groups.set(id, group);
  }
  return [...groups.values()];
}
