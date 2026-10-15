import {
  Avatar,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Timeline,
  Title,
  Button,
  Alert,
  Loader,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import {
  IconArrowRight,
  IconLink,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconTrash,
  IconUserEdit,
} from "@tabler/icons-react";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useGetActivityInfiniteQuery } from "@/entities/activity";
import { groupActivity, appendActivity, type LogEntry } from "./model/activity";
import classes from "./classes/LogsPage.module.css";

const actions = {
  create: { label: "Создание", color: "teal", icon: IconPlus },
  update: { label: "Обновление", color: "blue", icon: IconPencil },
  delete: { label: "Удаление", color: "red", icon: IconTrash },
  role: { label: "Изменение роли", color: "violet", icon: IconUserEdit },
  invite: { label: "Создание", color: "cyan", icon: IconLink },
  automatic: { label: "Автоматически", color: "gray", icon: IconSettings },
} as const;

function LogCard({ entry }: { entry: LogEntry }) {
  const action = actions[entry.action];
  const initials = entry.author.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <Paper
      component="article"
      aria-label={`${entry.author.name}: ${entry.title}`}
      withBorder
      p="lg"
      className={classes.card}
    >
      <Group
        gap="sm"
        wrap="nowrap"
        align="flex-start"
        className={classes.author}
      >
        <Avatar size={40} radius="xl" color={action.color}>
          {entry.action === "automatic" ? <IconSettings size={21} /> : initials}
        </Avatar>
        <Box miw={0}>
          <Text size="sm" fw={600}>
            {entry.author.name}
          </Text>
          <Text size="xs" c="dimmed" mt={3}>
            {entry.author.role}
          </Text>
        </Box>
      </Group>

      <Stack gap="xs" className={classes.content}>
        <Group gap={6}>
          <Badge color={action.color} variant="light" radius="sm">
            {action.label}
          </Badge>
          <Badge color="gray" variant="light" radius="sm">
            {entry.category}
          </Badge>
        </Group>
        <Box>
          <Text fw={600} size="sm">
            {entry.title}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {entry.description}
          </Text>
        </Box>
        {entry.change ? (
          <Box className={classes.change}>
            <Box className={classes.value}>
              <Text size="xs" c="dimmed">
                Было
              </Text>
              <Text size="sm" fw={500}>
                {entry.change.before}
              </Text>
            </Box>
            <IconArrowRight
              size={18}
              className={classes.arrow}
              aria-hidden="true"
            />
            <Box className={classes.value}>
              <Text size="xs" c={action.color}>
                Стало
              </Text>
              <Text size="sm" fw={500}>
                {entry.change.after}
              </Text>
            </Box>
          </Box>
        ) : (
          <Box className={classes.object}>
            <Text size="sm" fw={500}>
              {entry.object}
            </Text>
            {entry.detail && (
              <Text size="xs" c="dimmed" mt={3}>
                {entry.detail}
              </Text>
            )}
          </Box>
        )}
      </Stack>

      <Text
        component="time"
        dateTime={entry.timestamp}
        size="xs"
        c="dimmed"
        className={classes.timestamp}
      >
        {entry.dateLabel}, {entry.time}
      </Text>
    </Paper>
  );
}

export function LogsPage() {
  const query = useGetActivityInfiniteQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const entries = (query.data?.pages ?? []).reduce(
    (all, page) => appendActivity(all, page.items),
    [] as import("@/entities/activity").ActivityEntry[],
  );
  const logGroups = groupActivity(entries);
  return (
    <DefaultPageLayout
      title="Логи"
      subtitle="История действий в системе и журнал изменений"
      disableSearch
      disableStatistics
    >
      <ScrollArea className={classes.feed}>
        <Group justify="end" mb="md">
          <ActionIcon
            onClick={() => query.refetch()}
            loading={query.isFetching && !query.isFetchingNextPage}
            size="lg"
          >
            <IconRefresh />
          </ActionIcon>
        </Group>
        {query.isLoading && (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text>Загрузка событий…</Text>
          </Group>
        )}
        {query.isError && (
          <Alert color="red" mb="md" title="Не удалось загрузить журнал">
            <Button
              variant="subtle"
              onClick={() =>
                query.isFetchNextPageError
                  ? query.fetchNextPage()
                  : query.refetch()
              }
            >
              Повторить
            </Button>
          </Alert>
        )}
        {!query.isLoading && !query.isError && !entries.length && (
          <Text c="dimmed" py="xl">
            Действий пока нет. Новые события будут появляться здесь.
          </Text>
        )}
        <Stack gap="xl">
          {logGroups.map((group) => (
            <Box
              component="section"
              key={group.id}
              aria-labelledby={`logs-${group.id}`}
            >
              <Group gap="sm" mb="lg">
                <Title order={2} size="md" id={`logs-${group.id}`}>
                  {group.label}
                </Title>
                <Text size="xs" c="dimmed">
                  Записей: {group.entries.length}
                </Text>
              </Group>
              <Timeline
                bulletSize={34}
                lineWidth={2}
                active={group.entries.length - 1}
                className={classes.timeline}
              >
                {group.entries.map((entry) => {
                  const action = actions[entry.action];
                  const Icon = action.icon;
                  return (
                    <Timeline.Item
                      key={entry.id}
                      color={action.color}
                      bullet={<Icon size={17} aria-hidden="true" />}
                      className={classes.item}
                    >
                      <Text
                        component="time"
                        dateTime={entry.timestamp}
                        size="sm"
                        c="dimmed"
                        className={classes.time}
                      >
                        {entry.time}
                      </Text>
                      <LogCard entry={entry} />
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Box>
          ))}
        </Stack>
        {query.hasNextPage && (
          <Group justify="center" mt="xl" mb="md">
            <Button
              onClick={() => query.fetchNextPage()}
              loading={query.isFetchingNextPage}
              disabled={query.isFetching && !query.isFetchingNextPage}
            >
              Загрузить ещё
            </Button>
          </Group>
        )}
      </ScrollArea>
    </DefaultPageLayout>
  );
}
