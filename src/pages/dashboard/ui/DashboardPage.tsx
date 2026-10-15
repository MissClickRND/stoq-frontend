import { createElement, useState } from "react";
import { Alert, Button, Group, Select, Text } from "@mantine/core";
import {
  IconCoin,
  IconCoins,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useGetOrdersQuery, toOrder } from "@/entities/order";
import { useGetDishesQuery } from "@/entities/dish";
import { useGetStoreQuery } from "@/entities/store";
import {
  getDashboardStatistics,
  getLowStockProducts,
} from "../model/calculations";
import { DashboardChart } from "./components/DashboardChart/DashboardChart";
import { LowStockSection } from "./components/LowStockSection/LowStockSection";
import { ExpiringStockSection } from "./components/ExpiringStockSection/ExpiringStockSection";
import classes from "./classes/DashboardPage.module.css";

export default function DashboardPage() {
  const [days, setDays] = useState(14);
  const orders = useGetOrdersQuery(undefined, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
  });
  const dishes = useGetDishesQuery({ search: "" });
  const stock = useGetStoreQuery({ search: "" });
  const summary = getDashboardStatistics(
    (orders.currentData ?? []).map(toOrder),
    dishes.isError ? undefined : dishes.currentData,
    days,
  );
  const ready = Boolean(orders.currentData) && !orders.isError;
  const formatMoney = (value: number | null) =>
    value == null || !ready
      ? "0"
      : `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
  const statistics = [
    {
      title: "Выручка",
      value: formatMoney(summary.revenue),
      description: "По завершённым заказам",
      icon: IconCoins,
      color: "#0d5e24",
    },
    {
      title: "Расчётная прибыль",
      value: formatMoney(summary.earning),
      description: "Выручка минус текущая себестоимость",
      icon: IconTrendingUp,
      color: "#0f8c14",
    },
    {
      title: "Средний чек",
      value: formatMoney(summary.averageCheck),
      description: "По завершённым заказам",
      icon: IconCoin,
      color: "#730a17",
    },
    {
      title: "Количество заказов",
      value: ready ? summary.orders : "—",
      description: `Завершено: ${ready ? summary.completed : "—"}`,
      icon: IconShoppingCart,
      color: "#a15d10",
    },
  ].map((item) => ({ ...item, icon: createElement(item.icon) }));

  return (
    <DefaultPageLayout
      title="Дашборд"
      subtitle={`Основная статистика вашего ресторана за ${days} дн.`}
      disableSearch
      statisticData={statistics}
    >
      <Group justify="space-between" mb="md" align="flex-end">
        <Text size="xs" c="dimmed">
          Прибыль без аренды, зарплат и налогов. Для старых блюд без
          себестоимости — прочерк.
        </Text>
        <Select
          aria-label="Период дашборда"
          label="Период"
          w={180}
          value={String(days)}
          allowDeselect={false}
          data={[
            { value: "7", label: "7 дней" },
            { value: "14", label: "14 дней" },
            { value: "30", label: "30 дней" },
          ]}
          onChange={(value) => value && setDays(Number(value))}
        />
      </Group>
      {orders.isError && (
        <Alert color="red" title="Не удалось загрузить заказы" mb="md">
          <Button variant="subtle" onClick={() => orders.refetch()}>
            Повторить
          </Button>
        </Alert>
      )}
      {dishes.isError && (
        <Alert color="orange" mb="md">
          Себестоимость недоступна. Расчёт прибыли временно недоступен.{" "}
          <Button variant="subtle" onClick={() => dishes.refetch()}>
            Повторить
          </Button>
        </Alert>
      )}
      <div className={classes.dashboard}>
        <DashboardChart
          points={summary.points}
          loading={orders.isLoading}
          unavailable={!ready}
        />
        <div className={classes.stockSections}>
          <LowStockSection
            products={getLowStockProducts(stock.currentData ?? [])}
            loading={stock.isLoading}
            error={stock.isError}
            onRetry={() => stock.refetch()}
          />
          <ExpiringStockSection />
        </div>
      </div>
    </DefaultPageLayout>
  );
}
