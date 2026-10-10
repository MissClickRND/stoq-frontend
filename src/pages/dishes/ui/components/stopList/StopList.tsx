import TableLayout from "@/widgets/table-layout";
import type { Dish } from "../../../model/type";
import { dishColumns } from "../../../model/data";
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
