import TableLayout from "@/shared/ui/table-layout";
import type { IDish, IRecommendedDishes } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { RecommendationRow } from "./RecommendationRow";

export function RecommendationPage({
  dishes,
  catalog,
}: {
  dishes: IRecommendedDishes[];
  catalog: IDish[];
}) {
  return (
    <TableLayout
      columns={dishColumns.recommended}
      data={dishes}
      getRowKey={(dish) => dish.dishId}
      minWidth={1150}
      emptyText="Рекомендуемые блюда не найдены"
      renderRow={(dish) => <RecommendationRow dish={dish} catalogDish={catalog.find((item) => item.id === dish.dishId)} />}
    />
  );
}
