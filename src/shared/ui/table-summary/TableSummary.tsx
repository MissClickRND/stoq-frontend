import { Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "./classes/TableSummary.module.css";

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
    <Group justify="space-between" className={classes.summary}>
      <div>
        <Text size="lg" fw={600}>
          <Text component="span" inherit fw={700}>
            {count}
          </Text>{" "}
          шт.
        </Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </div>
      <div className={classes.actions}>{action}</div>
    </Group>
  );
}
