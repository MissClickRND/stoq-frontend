import TableLayout from "@/shared/ui/table-layout";
import type { Dish } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { StopListRow } from "./StopListRow";

export function StopList({ dishes }: { dishes: Dish[] }) {
  return (
    <TableLayout
      columns={dishColumns.stop}
      data={dishes}
      getRowKey={(dish) => dish.id}
      minWidth={1000}
      emptyText="В стоп-листе нет блюд"
      renderRow={(dish) => <StopListRow dish={dish} />}
    />
  );
}
