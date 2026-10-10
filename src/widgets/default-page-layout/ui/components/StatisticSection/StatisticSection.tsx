import { SimpleGrid } from "@mantine/core";
import type { IStatisticCardData } from "../../model/type";
import { StatisticCard } from "./StatisticCard";

export default function StatisticSection({
  statisticData,
}: {
  statisticData: IStatisticCardData[];
}) {
  return (
    <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="xs">
      {statisticData.map((item, index) => (
        <StatisticCard key={index} {...item} />
      ))}
    </SimpleGrid>
  );
}
