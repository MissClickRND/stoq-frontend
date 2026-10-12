import {
  Center,
  Stack,
  Text,
  ThemeIcon,
  type MantineColor,
} from "@mantine/core";
import { IconChartBar, IconLeaf } from "@tabler/icons-react";
import classes from "./AnalyticsPlaceholder.module.css";

type Props = {
  icon: typeof IconChartBar;
  color: MantineColor;
};

function AnalyticsPlaceholder({ icon: Icon, color }: Props) {
  return (
    <Center className={classes.placeholder}>
        <Stack align="center" gap="md" maw={420} ta="center">
          <ThemeIcon variant="light" color={color} size={64} radius="xl">
            <Icon size={30} stroke={1.5} />
          </ThemeIcon>
          <Text size="lg" fw={600}>
            Раздел готовится
          </Text>
          <Text c="dimmed">
            Сейчас доступна карта зависимостей: посмотрите связи ингредиентов с
            блюдами и их доступность.
          </Text>
        </Stack>
    </Center>
  );
}

export function AnalyticsDashboardPage() {
  return (
    <AnalyticsPlaceholder
      icon={IconChartBar}
      color="primary"
    />
  );
}

export function IngredientAnalysisPage() {
  return (
    <AnalyticsPlaceholder
      icon={IconLeaf}
      color="primary"
    />
  );
}
