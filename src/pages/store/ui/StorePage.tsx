import DefaultPageLayout from "@/widgets/default-page-layout";
import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import StoreTableSection from "./components/StoreTableSection";
import { storeStatisticData } from "../model/data";

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
      statisticData={storeStatisticData}
    >
      <StoreTableSection searchValue={debouncedSearchValue} />
    </DefaultPageLayout>
  );
}
