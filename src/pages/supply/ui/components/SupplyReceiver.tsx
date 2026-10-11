import { Avatar, Group, Text } from "@mantine/core";
import classes from "./SupplyHeader.module.css";

export function SupplyReceiver({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <Group gap="sm" wrap="nowrap" className={classes.receiver}>
      <Avatar size={32} radius="xl" color="gray">
        {initials}
      </Avatar>
      <div>
        <Text size="xs" c="dimmed" lh={1.2}>
          Принял
        </Text>
        <Text size="lg" fw={600} lh={1.2}>
          {name}
        </Text>
      </div>
    </Group>
  );
}
