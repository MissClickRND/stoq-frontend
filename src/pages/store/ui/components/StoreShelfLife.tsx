import { Stack, Text } from "@mantine/core";
import {
  formatShelfLifeDays,
  getShelfLifeDays,
  soonExpiredDays,
} from "@/entities/stock";

export function StoreShelfLife({ shelfLife }: { shelfLife: string }) {
  const days = getShelfLifeDays(shelfLife);
  const color =
    days === null
      ? "dimmed"
      : days < 0
        ? "red"
        : days <= soonExpiredDays
          ? "orange"
          : undefined;

  return (
    <Stack gap={2}>
      <Text size="lg" fw={600} c={color} lh={1.3}>
        {days === null ? "Срок не определён" : formatShelfLifeDays(days)}
      </Text>
      <Text size="sm" c="dimmed" lh={1.3}>
        до {shelfLife}
      </Text>
    </Stack>
  );
}
