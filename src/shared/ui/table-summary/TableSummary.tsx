import { Group, Text } from "@mantine/core";
import type { ReactNode } from "react";

export function TableSummary({
  count,
  description,
  action,
}: {
  count: number;
  description: string;
  action: ReactNode;
}) {
  return (
    <Group justify="space-between" style={{ flexShrink: 0 }}>
      <div>
        <Text size="lg" fw={600}>
          Количество:{" "}
          <Text component="span" inherit fw={700}>
            {count}
          </Text>{" "}
          шт.
        </Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </div>
      {action}
    </Group>
  );
}
