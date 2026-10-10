import { createElement } from "react";
import { StatisticSection } from "@/widgets/default-page-layout";
import type { Dish } from "../../../model/type";
import { dishIsStopped, dishPortions } from "../../../model/calculations";
import { detailStatisticItems } from "../../../model/data";

export function DishDetailsStatistics({
  dish,
  dishes,
}: {
  dish: Dish;
  dishes: Dish[];
}) {
  const sold = (item: Dish) =>
    item.sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const rank = 1 + dishes.filter((item) => sold(item) > sold(dish)).length;
  const values = {
    today: dish.sales.at(-1)?.quantity ?? 0,
    week: sold(dish),
    popularity: `#${rank}`,
    stock: dish.archived
      ? "В архиве"
      : dishIsStopped(dish)
        ? "Недоступно"
        : `${dishPortions(dish)} порций`,
  };
  return (
    <StatisticSection
      statisticData={detailStatisticItems.map((item) => ({
        title: item.title,
        value: values[item.key],
        color: item.color,
        icon: createElement(item.icon),
      }))}
    />
  );
}
