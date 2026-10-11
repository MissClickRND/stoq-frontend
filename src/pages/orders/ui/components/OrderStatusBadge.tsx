import { Badge } from "@mantine/core";
import { orderStatuses } from "../../model/data";
import type { OrderStatus } from "../../model/type";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const item = orderStatuses[status];
  return (
    <Badge
      size="lg"
      variant="light"
      color={item.color}
      tt="none"
      miw="max-content"
    >
      {item.label}
    </Badge>
  );
}
