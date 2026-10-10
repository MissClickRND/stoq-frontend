import { SimpleGrid } from "@mantine/core";
import type { IStatisticCardData } from "../../model/type";
import { StatisticCard } from "./StatisticCard";

export default function StatisticSection({
  statisticData,
}: {
  statisticData: IStatisticCardData[];
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
      {statisticData.map((item, index) => (
        <StatisticCard key={index} {...item} />
      ))}
    </SimpleGrid>
  );
}
