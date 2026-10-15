import { Badge } from "@mantine/core";
import { storeStatuses, type IStoreStatus } from "@/entities/store";

export function StoreProductStatus({ status }: { status: string }) {
  const item = storeStatuses[status as IStoreStatus];
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
