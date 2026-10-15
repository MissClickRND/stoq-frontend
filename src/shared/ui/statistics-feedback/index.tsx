import { Alert, Button, Group, Loader, Text } from "@mantine/core";
export function StatisticsFeedback({ query }: { query: { isError: boolean; isFetching: boolean; currentData?: unknown; refetch: () => unknown } }) {
  if (query.isError) return <Alert color="red" title="Статистика недоступна" role="alert"><Button variant="subtle" onClick={() => query.refetch()}>Повторить загрузку статистики</Button></Alert>;
  if (!query.currentData && query.isFetching) return <Group role="status"><Loader size="xs" /><Text size="sm" c="dimmed">Загрузка статистики…</Text></Group>;
  return null;
}
