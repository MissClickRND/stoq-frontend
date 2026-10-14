import TableLayout from "@/shared/ui/table-layout";
import type { IStopListDish } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { StopListRow } from "./StopListRow";

export function StopList({
  stopListDishes,
}: {
  stopListDishes: IStopListDish[];
}) {
  return (
    <TableLayout
      columns={dishColumns.stop}
      data={stopListDishes}
      getRowKey={(dish) => dish.dishId}
      minWidth={1100}
      emptyText="В стоп-листе нет блюд"
      renderRow={(dish) => <StopListRow dish={dish} />}
    />
  );
}
