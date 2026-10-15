import { Center, Loader, Paper, SegmentedControl, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import { useState } from "react";
import type { DashboardPoint, DashboardStatistic } from "@/entities/statistic";
import classes from "./DashboardChart.module.css";

const metrics = {
  revenue: {
    label: "Выручка",
    color: "primary.7",
    unit: "₽",
  },
  earning: { label: "Расчётная прибыль", color: "teal.6", unit: "₽" },
  orders: { label: "Заказы", color: "blue.6", unit: "" },
} as const;

type Metric = keyof typeof metrics;
const numberFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

export function DashboardChart({
  points, summary,
  loading,
  unavailable,
}: {
  points: DashboardPoint[]; summary?: DashboardStatistic["summary"];
  loading: boolean;
  unavailable: boolean;
}) {
  const [selectedTab, setSelectedTab] = useState<Metric>("revenue");
  const metric = metrics[selectedTab];
  const data = points.map((point) => ({
    date: point.label,
    value: point[selectedTab],
  }));
  const total = unavailable ? null : summary?.[selectedTab] ?? null;
  const formatValue = (value: number) =>
    `${numberFormat.format(value)}${metric.unit ? ` ${metric.unit}` : ""}`;

  return (
    <Paper
      component="section"
      withBorder
      className={classes.chartCard}
      aria-label="Динамика показателей"
    >
      <div className={classes.cardHeader}>
        <div>
          <Text size="sm" c="dimmed">
            {metric.label} за период
          </Text>
          <Text className={classes.total} aria-live="polite">
            {loading ? "Загрузка…" : total === null ? "—" : formatValue(total)}
          </Text>
        </div>
        <SegmentedControl
          value={selectedTab}
          onChange={(value) => setSelectedTab(value as Metric)}
          data={Object.entries(metrics).map(([value, item]) => ({
            value,
            label: item.label,
          }))}
          className={classes.metricControl}
          aria-label="Показатель графика"
        />
      </div>

      <div
        className={classes.chart}
        role="img"
        aria-label={`${metric.label}, ${points[0]?.date} — ${points.at(-1)?.date}. Итого: ${total === null ? "нет данных" : formatValue(total)}`}
      >
        {loading ? (
          <Center h={240}>
            <Loader aria-label="Загрузка графика" />
          </Center>
        ) : unavailable ? (
          <Text c="dimmed">Данные графика недоступны</Text>
        ) : (
          <>
            {total === null && (
              <Text c="dimmed" size="xs">
                Для части заказов нет цены или себестоимости. Итог не рассчитан.
              </Text>
            )}
            {!points.some((point) => point.orders > 0) && (
              <Text c="dimmed" size="sm">
                За выбранный период заказов нет
              </Text>
            )}
            <LineChart
              key={selectedTab}
              data={data}
              h="100%"
              dataKey="date"
              series={[
                { name: "value", label: metric.label, color: metric.color },
              ]}
              curveType="monotone"
              strokeWidth={3}
              activeDotProps={{ r: 5, strokeWidth: 3 }}
              gridAxis="y"
              tickLine="none"
              valueFormatter={formatValue}
              xAxisProps={{ minTickGap: 28, tickMargin: 12 }}
              yAxisProps={{
                width: selectedTab === "orders" ? 35 : 75,
                tickCount: 5,
                allowDecimals: false,
              }}
              lineChartProps={{
                margin: { top: 12, right: 12, bottom: 8, left: 0 },
              }}
            />
          </>
        )}
      </div>
    </Paper>
  );
}
