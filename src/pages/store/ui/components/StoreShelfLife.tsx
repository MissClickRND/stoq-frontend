import { Stack, Text } from "@mantine/core";
import {
  formatShelfLifeDate,
  formatShelfLifeDays,
  getShelfLifeDays,
  type IStoreStatus,
} from "@/entities/store";

export function StoreShelfLife({ shelfLife, status }: {
  shelfLife: string;
  status: IStoreStatus;
}) {
  const days = getShelfLifeDays(shelfLife);
  const color = { ACTIVE: "green", DEPLETED: "orange", EXPIRED: "red" };
  return (
    <Stack gap={2}>
      <Text size="lg" fw={600} c={color[status]} lh={1.3}>
        {days === null ? "Срок не определён" : formatShelfLifeDays(days)}
      </Text>
      <Text size="sm" c="dimmed" lh={1.3}>
        {days === null ? "—" : "до " + formatShelfLifeDate(shelfLife)}
      </Text>
    </Stack>
  );
}
