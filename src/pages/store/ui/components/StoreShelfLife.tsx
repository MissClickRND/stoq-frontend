import { Stack, Text } from "@mantine/core";
import {
  formatShelfLifeDate,
  formatShelfLifeDays,
  getShelfLifeDays,
  getShelfLifeColor,
} from "@/entities/store";

export function StoreShelfLife({ shelfLife }: {
  shelfLife: string;
}) {
  const days = getShelfLifeDays(shelfLife);
  return (
    <Stack gap={2}>
      <Text size="lg" fw={600} c={getShelfLifeColor(days)} lh={1.3}>
        {days === null ? "Срок не определён" : formatShelfLifeDays(days)}
      </Text>
      <Text size="sm" c="dimmed" lh={1.3}>
        {days === null ? "—" : "до " + formatShelfLifeDate(shelfLife)}
      </Text>
    </Stack>
  );
}
