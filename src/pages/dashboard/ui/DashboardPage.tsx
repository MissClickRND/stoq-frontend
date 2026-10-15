import { createElement, useState } from "react";
import { Group, Select, Text } from "@mantine/core";
import { IconCoin, IconCoins, IconShoppingCart, IconTrendingUp } from "@tabler/icons-react";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useGetDashboardStatisticQuery, useGetDishStatisticQuery, useGetInventoryStatisticQuery, statisticsQueryOptions } from "@/entities/statistic";
import { StatisticsFeedback } from "@/shared/ui/statistics-feedback";
import { formatCurrency } from "@/shared/lib/format";
import { DashboardChart } from "./components/DashboardChart/DashboardChart";
import { LowStockSection } from "./components/LowStockSection/LowStockSection";
import { ExpiringStockSection } from "./components/ExpiringStockSection/ExpiringStockSection";
import { ShortageSection } from "./components/ShortageSection/ShortageSection";
import { DishDistribution } from "./components/DishDistribution/DishDistribution";
import classes from "./classes/DashboardPage.module.css";
export default function DashboardPage() {
  const [days, setDays] = useState(14);
  const dashboard = useGetDashboardStatisticQuery(days, statisticsQueryOptions);
  const dishes = useGetDishStatisticQuery(undefined, statisticsQueryOptions);
  const inventory = useGetInventoryStatisticQuery(undefined, statisticsQueryOptions);
  const summary = dashboard.isError ? undefined : dashboard.currentData?.summary;
  const money = (value: number | null | undefined) => value == null ? "—" : formatCurrency(value);
  const statistics = [
    { title: "Выручка", value: money(summary?.revenue), description: "По завершённым заказам", icon: IconCoins, color: "#0d5e24" },
    { title: "Расчётная прибыль", value: money(summary?.earning), description: "Выручка минус текущая себестоимость", icon: IconTrendingUp, color: "#0f8c14" },
    { title: "Средний чек", value: money(summary?.averageCheck), description: "По завершённым заказам", icon: IconCoin, color: "#730a17" },
    { title: "Количество заказов", value: summary?.orders ?? "—", description: `Завершено: ${summary?.completed ?? "—"}`, icon: IconShoppingCart, color: "#a15d10" },
  ].map(item => ({ ...item, icon: createElement(item.icon) }));
  return <DefaultPageLayout title="Дашборд" subtitle={`Основная статистика вашего ресторана за ${days} дн.`} disableSearch statisticData={statistics}>
    <Group justify="space-between" mb="md" align="flex-end"><Text size="xs" c="dimmed">Прибыль без аренды, зарплат и налогов. Текущая себестоимость — оценка; неизвестные суммы — прочерк.</Text><Select aria-label="Период дашборда" label="Период" w={180} value={String(days)} allowDeselect={false} data={[{ value: "7", label: "7 дней" }, { value: "14", label: "14 дней" }, { value: "30", label: "30 дней" }]} onChange={value => value && setDays(Number(value))} /></Group>
    <StatisticsFeedback query={dashboard} />
    <div className={classes.dashboard}>
      <div className={classes.chart}><DashboardChart points={dashboard.currentData?.points ?? []} summary={summary} loading={!dashboard.currentData && dashboard.isFetching} unavailable={!summary} /></div>
      <div className={classes.shortages}><ShortageSection days={days} /></div>
      <div className={classes.distribution}><DishDistribution query={dishes} /></div>
      <div className={classes.stockSections}><LowStockSection products={inventory.currentData?.lowStockProducts ?? []} loading={!inventory.currentData && inventory.isFetching} error={inventory.isError} onRetry={() => inventory.refetch()} /><ExpiringStockSection /></div>
    </div>
  </DefaultPageLayout>;
}
