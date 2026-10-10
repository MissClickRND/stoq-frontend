import DefaultPageLayout from "@/widgets/default-page-layout";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertTriangle, IconBox, IconClock } from "@tabler/icons-react";
import { useState } from "react";

const MockStatisticData = [
  {
    title: "Всего продуктов",
    value: 120,
    description: "На складе",
    icon: <IconBox />,
    color: "green",
  },
  {
    title: "Заканчиваются",
    value: 12,
    description: "Требуется пополнение",
    icon: <IconAlertTriangle />,
    color: "orange",
  },
  {
    title: "Скоро испортятся",
    value: 8,
    icon: <IconClock />,
    color: "red",
  },
  {
    title: "Скоро испортятся",
    value: 8,
    icon: <IconClock />,
    color: "red",
  },
];

export default function StorePage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 200);

  return (
    <DefaultPageLayout
      title="Склад"
      subtitle="Управление складом и остатками продуктов"
      searchTitle="Поиск продуктов по названию"
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      statisticData={MockStatisticData}
    >
      <div>Содержимое страницы</div>
    </DefaultPageLayout>
  );
}
