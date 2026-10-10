import { Badge } from "@mantine/core";
import { productStatuses } from "../../model/table-data";

export function StoreProductStatus({ status }: { status: string }) {
  const item = productStatuses[status];
  return (
    <Badge
      size="lg"
      w="max-content"
      miw="max-content"
      variant="light"
      color={item?.color ?? "gray"}
      tt="none"
    >
      {item?.label ?? status}
    </Badge>
  );
}
