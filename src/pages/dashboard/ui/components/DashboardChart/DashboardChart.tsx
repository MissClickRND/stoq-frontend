import { Paper, SegmentedControl, Text } from "@mantine/core";
import { LineChart } from "@mantine/charts";
import { useState } from "react";
import { mockEarning, mockOrders, mockRevenue } from "../../../model/mock";
import classes from "./DashboardChart.module.css";

const metrics = {
  revenue: {
    label: "Выручка",
    data: mockRevenue,
    color: "primary.7",
    unit: "₽",
  },
  earning: { label: "Прибыль", data: mockEarning, color: "teal.6", unit: "₽" },
  orders: { label: "Заказы", data: mockOrders, color: "blue.6", unit: "" },
} as const;

type Metric = keyof typeof metrics;
const numberFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

export function DashboardChart() {
  const [selectedTab, setSelectedTab] = useState<Metric>("revenue");
  const metric = metrics[selectedTab];
  const total = metric.data.reduce((sum, point) => sum + point.value, 0);
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
            {formatValue(total)}
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
        aria-label={`${metric.label} с 1 по 14 октября. Итого: ${formatValue(total)}`}
      >
        <LineChart
          key={selectedTab}
          data={metric.data}
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
      </div>
    </Paper>
  );
}
