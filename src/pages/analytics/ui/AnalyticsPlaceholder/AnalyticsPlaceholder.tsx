import {
  Center,
  Stack,
  Text,
  ThemeIcon,
  type MantineColor,
} from "@mantine/core";
import { IconChartBar, IconLeaf } from "@tabler/icons-react";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useAnalyticsNavigation } from "../../model/useAnalyticsNavigation";
import classes from "./AnalyticsPlaceholder.module.css";

type Props = {
  title: string;
  subtitle: string;
  icon: typeof IconChartBar;
  color: MantineColor;
};

function AnalyticsPlaceholder({ title, subtitle, icon: Icon, color }: Props) {
  const navigation = useAnalyticsNavigation();
  return (
    <DefaultPageLayout
      title={title}
      subtitle={subtitle}
      disableSearch
      disableStatistics
      topSection={navigation}
    >
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
    </DefaultPageLayout>
  );
}

export function AnalyticsDashboardPage() {
  return (
    <AnalyticsPlaceholder
      title="Дашборд"
      subtitle="Основная статистика вашего ресторана"
      icon={IconChartBar}
      color="primary"
    />
  );
}

export function IngredientAnalysisPage() {
  return (
    <AnalyticsPlaceholder
      title="Анализ ингредиентов"
      subtitle="Расход, остатки и потребность в ингредиентах"
      icon={IconLeaf}
      color="primary"
    />
  );
}
