import { createElement } from "react";
import { StatisticSection } from "@/widgets/default-page-layout";
import type { DishDetailsStatistic } from "@/entities/statistic";
import { detailStatisticItems } from "../../../model/config";
export function DishDetailsStatistics({ statistic }: { statistic?: DishDetailsStatistic }) {
  const values = { today: statistic?.today ?? "—", week: statistic?.week ?? "—", popularity: statistic?.popularity == null ? "—" : `#${statistic.popularity}`, stock: statistic ? `${statistic.availablePortions} порций` : "—" };
  return <StatisticSection statisticData={detailStatisticItems.map(item => ({ title: item.title, value: values[item.key], color: item.color, icon: createElement(item.icon) }))} />;
}
