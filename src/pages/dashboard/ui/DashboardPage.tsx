import { mockLowStockProducts } from "../model/low-stock-mock";
import { DashboardChart } from "./components/DashboardChart/DashboardChart";
import { LowStockSection } from "./components/LowStockSection/LowStockSection";
import classes from "./DashboardPage.module.css";

export default function DashboardPage() {
  return (
    <div className={classes.dashboard}>
      <DashboardChart />
      <LowStockSection products={mockLowStockProducts} />
    </div>
  );
}
