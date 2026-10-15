import TableLayout from "@/shared/ui/table-layout";
import type { IDish, IStopListDish } from "@/entities/dish";
import { dishColumns } from "../../../model/config";
import { StopListRow } from "./StopListRow";

export function StopList({
  stopListDishes,
  catalog,
}: {
  stopListDishes: IStopListDish[];
  catalog: IDish[];
}) {
  return (
    <TableLayout
      columns={dishColumns.stop}
      data={stopListDishes}
      getRowKey={(dish) => dish.dishId}
      minWidth={1100}
      emptyText="В стоп-листе нет блюд"
      renderRow={(dish) => <StopListRow dish={dish} catalogDish={catalog.find((item) => item.id === dish.dishId)} />}
    />
  );
}
