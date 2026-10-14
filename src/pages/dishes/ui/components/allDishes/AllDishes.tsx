import TableLayout from "@/shared/ui/table-layout";
import type { IDish } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { AllDishesRow } from "./AllDishesRow";

export function AllDishes({ dishes }: { dishes: IDish[] }) {
  return (
    <TableLayout
      columns={dishColumns.all}
      data={dishes}
      getRowKey={(dish) => dish.id}
      minWidth={1100}
      emptyText="Блюда не найдены"
      renderRow={(dish) => <AllDishesRow dish={dish} />}
    />
  );
}
