import {
  Alert,
  Anchor,
  Badge,
  Center,
  Button,
  Group,
  Loader,
  Select,
  ScrollArea,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatShelfLifeDate,
  formatShelfLifeDays,
  getShelfLifeDays,
  getShelfLifeColor,
  soonExpiredDays,
  useGetExpiringStoreQuery,
} from "@/entities/store";
import { normalizeArticle } from "@/shared/lib/format";
import classes from "./ExpiringStockSection.module.css";

const quantityFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 3,
});

const periods = [
  { value: "0", label: "Сегодня" },
  { value: "3", label: "3 дня" },
  { value: "5", label: "5 дней" },
  { value: "7", label: "Неделя" },
  { value: "14", label: "14 дней" },
];

export function ExpiringStockSection() {
  const [daysThreshold, setDaysThreshold] = useState(soonExpiredDays);
  const { currentData, isFetching, isError, refetch } =
    useGetExpiringStoreQuery(
      // A zero-day API window is empty; fetch one day and keep today's dates.
      { daysThreshold: daysThreshold === 0 ? 1 : daysThreshold },
      { refetchOnMountOrArgChange: true },
    );
  const products = (currentData ?? []).filter(
    (item) => daysThreshold !== 0 || getShelfLifeDays(item.expiresAt) === 0,
  );

  return (
    <Paper
      component="section"
      withBorder
      className={classes.section}
      aria-labelledby="dashboard-expiring-title"
    >
      <Group
        className={classes.header}
        justify="space-between"
        align="flex-start"
        wrap="nowrap"
      >
        <Group gap="xs" className={classes.heading}>
          <Title
            order={2}
            id="dashboard-expiring-title"
            className={classes.title}
          >
            Скоро испортятся
          </Title>
          {currentData && !isError && (
            <Badge variant="light" color="orange">
              {products.length}
            </Badge>
          )}
        </Group>
        <Select
          aria-label="Порог срока годности"
          data={periods}
          value={String(daysThreshold)}
          onChange={(value) => {
            if (value !== null) setDaysThreshold(Number(value));
          }}
          allowDeselect={false}
          size="sm"
          className={classes.threshold}
        />
      </Group>
      <ScrollArea
        key={daysThreshold}
        className={classes.scrollArea}
        classNames={{ viewport: classes.viewport }}
        type="auto"
        scrollbars="y"
        offsetScrollbars="y"
        scrollbarSize={6}
        overscrollBehavior="contain"
        viewportProps={{
          role: "region",
          "aria-label": "Продукты с истекающим сроком годности",
          tabIndex: 0,
        }}
      >
        {isError ? (
          <Alert m="md" color="red" title="Не удалось загрузить продукты">
            <Button variant="subtle" onClick={() => refetch()}>
              Повторить
            </Button>
          </Alert>
        ) : isFetching && !currentData ? (
          <Center p="xl">
            <Loader size="sm" aria-label="Загрузка скоропортящихся продуктов" />
          </Center>
        ) : products.length ? (
          <ul className={classes.list}>
            {products.map((item) => (
              <li key={item.batchId} className={classes.item}>
                <Group justify="space-between" gap="xs" align="flex-start">
                  <Anchor
                    component={Link}
                    to={`/store/${item.batchId}`}
                    fw={600}
                    size="sm"
                    className={classes.name}
                  >
                    {item.product?.name ?? `Продукт № ${item.productId}`}
                  </Anchor>
                  <Text size="sm" fw={700} className={classes.quantity}>
                    {quantityFormat.format(Number(item.availableQuantity))}{" "}
                    {item.product?.unit?.shortName ?? "шт."}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" mt={3}>
                  Партия № {normalizeArticle(item.batchId)}
                </Text>
                <Group justify="space-between" gap="xs" mt="xs">
                  <Text size="xs" c="dimmed">
                    до {formatShelfLifeDate(item.expiresAt)}
                  </Text>
                  <Badge
                    color={getShelfLifeColor(getShelfLifeDays(item.expiresAt))}
                    variant="light"
                    tt="none"
                  >
                    {formatShelfLifeDays(item.daysRemaining)}
                  </Badge>
                </Group>
              </li>
            ))}
          </ul>
        ) : (
          <Text size="sm" c="dimmed" p="lg">
            {daysThreshold === 0
              ? "Сегодня срок годности продуктов не истекает"
              : `Нет партий с истекающим сроком годности в течение ${daysThreshold} дн.`}
          </Text>
        )}
      </ScrollArea>
    </Paper>
  );
}
