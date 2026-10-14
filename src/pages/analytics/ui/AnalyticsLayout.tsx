import { Outlet } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useAnalyticsNavigation } from "../model/useAnalyticsNavigation";
import {
  IconCoin,
  IconCoins,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react";
import { createElement } from "react";

export function AnalyticsLayout() {
  const { title, subtitle, statistic, ...navigation } =
    useAnalyticsNavigation();

  const dishStatisticItems = [
    {
      key: "total",
      title: "Прибыль",
      description: "Общая прибыль заведения",
      icon: IconCoins,
      color: "#0d5e24",
    },
    {
      key: "revenue",
      title: "Прибыль",
      description: "Чистая прибыль",
      icon: IconTrendingUp,
      color: "#0f8c14",
    },
    {
      key: "median",
      title: "Средний чек",
      description: "Тратят за 1 заказ",
      icon: IconCoin,
      color: "#730a17",
    },
    {
      key: "orders",
      title: "Количество заказов",
      description: "Общее количество",
      icon: IconShoppingCart,
      color: "#a15d10",
    },
  ];

  const counts = {
    total: 1,
    revenue: 1,
    median: 1,
    orders: 1,
  };
  const statistics = dishStatisticItems.map((item) => ({
    title: item.title,
    description: item.description,
    //@ts-ignore
    value: counts[item.key],
    color: item.color,
    icon: createElement(item.icon),
  }));

  return (
    <DefaultPageLayout
      title={title}
      subtitle={subtitle}
      disableSearch
      disableStatistics={!statistic}
      statisticData={statistics}
      topSection={navigation}
    >
      <Outlet />
    </DefaultPageLayout>
  );
}
