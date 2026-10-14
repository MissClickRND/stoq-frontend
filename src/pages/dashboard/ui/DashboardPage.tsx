import { createElement } from "react";
import {
  IconCoin,
  IconCoins,
  IconShoppingCart,
  IconTrendingUp,
} from "@tabler/icons-react";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { mockLowStockProducts } from "../model/low-stock-mock";
import { DashboardChart } from "./components/DashboardChart/DashboardChart";
import { LowStockSection } from "./components/LowStockSection/LowStockSection";
import classes from "./DashboardPage.module.css";

export default function DashboardPage() {
  const statistics = [
    { title: "Прибыль", description: "Общая прибыль заведения", icon: IconCoins, color: "#0d5e24" },
    { title: "Прибыль", description: "Чистая прибыль", icon: IconTrendingUp, color: "#0f8c14" },
    { title: "Средний чек", description: "Тратят за заказ", icon: IconCoin, color: "#730a17" },
    { title: "Количество заказов", description: "Общее количество", icon: IconShoppingCart, color: "#a15d10" },
  ].map((item) => ({ ...item, value: 1, icon: createElement(item.icon) }));

  return (
    <DefaultPageLayout
      title="Дашборд"
      subtitle="Основная статистика вашего ресторана"
      disableSearch
      statisticData={statistics}
    >
      <div className={classes.dashboard}>
        <DashboardChart />
        <LowStockSection products={mockLowStockProducts} />
      </div>
    </DefaultPageLayout>
  );
}
