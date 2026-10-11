import DefaultPageLayout from "@/widgets/default-page-layout";
import { DependencyGraph } from "@/widgets/dependency-graph";
import { useAnalyticsNavigation } from "../../model/useAnalyticsNavigation";

export function DependencyMapPage() {
  const navigation = useAnalyticsNavigation();
  return (
    <DefaultPageLayout
      title="Карта зависимостей"
      subtitle="Подробные связи продуктов и блюд"
      disableSearch
      disableStatistics
      topSection={navigation}
    >
      <DependencyGraph />
    </DefaultPageLayout>
  );
}
