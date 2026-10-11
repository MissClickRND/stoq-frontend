import TableLayout from "@/shared/ui/table-layout";
import type { Dish } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { AllDishesRow } from "./AllDishesRow";

export function AllDishes({ dishes }: { dishes: Dish[] }) {
  return (
    <TableLayout
      columns={dishColumns.all}
      data={dishes}
      getRowKey={(dish) => dish.id}
      minWidth={850}
      emptyText="Блюда не найдены"
      renderRow={(dish) => <AllDishesRow dish={dish} />}
    />
  );
}
