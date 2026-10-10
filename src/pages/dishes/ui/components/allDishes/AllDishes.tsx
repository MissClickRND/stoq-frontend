import TableLayout from "@/widgets/table-layout";
import type { Dish } from "../../../model/type";
import { dishColumns } from "../../../model/data";
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
