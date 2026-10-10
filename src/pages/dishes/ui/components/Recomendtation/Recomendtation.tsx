import TableLayout from "@/widgets/table-layout";
import type { Dish } from "../../../model/type";
import { dishColumns } from "../../../model/data";
import { RecommendationRow } from "./RecommendationRow";

export function Recomendtation({ dishes }: { dishes: Dish[] }) {
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
