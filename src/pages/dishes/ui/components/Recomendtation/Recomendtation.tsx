import TableLayout from "@/shared/ui/table-layout";
import type { Dish } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { RecommendationRow } from "./RecommendationRow";

export function Recommendation({ dishes }: { dishes: Dish[] }) {
  return (
    <TableLayout
      columns={dishColumns.recommended}
      data={dishes}
      getRowKey={(dish) => dish.id}
      minWidth={1150}
      emptyText="Рекомендуемые блюда не найдены"
      renderRow={(dish) => <RecommendationRow dish={dish} />}
    />
  );
}
