import { Box, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import type { IStatisticCardData } from "../../model/type";
import classes from "./StatisticCard.module.css";

export function StatisticCard({
  title,
  value,
  description,
  icon,
  color,
}: IStatisticCardData) {
  return (
    <Paper className={classes.card} radius="lg" p={{ base: "xs", sm: "md" }}>
      <Group className={classes.cardGroup} gap="md" wrap="nowrap" align="center">
        <ThemeIcon
          className={classes.icon}
          variant="light"
          size={64}
          radius="xl"
          color={color}
        >
          {icon}
        </ThemeIcon>
        <Box className={classes.content}>
          <Text className={classes.title} size="xs" fw={600} c="dimmed">
            {title}
          </Text>
          <Text className={classes.value} fw={750}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" className={classes.description}>
              {description}
            </Text>
          )}
        </Box>
      </Group>
    </Paper>
  );
}
