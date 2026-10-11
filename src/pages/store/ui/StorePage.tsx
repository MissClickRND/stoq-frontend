import DefaultPageLayout from "@/widgets/default-page-layout";
import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import StoreTableSection from "./components/StoreTableSection";
import { storeStatisticData } from "../model/data";
import { Button } from "@mantine/core";
import { TableSummary } from "@/shared/ui/table-summary";
import { matchesStoreProduct } from "../model/search";
import { IconClipboardCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useStoreProducts } from "../model/StoreProvider";

export default function StorePage() {
  const { products } = useStoreProducts();
  const counts = [
    products.length,
    products.filter((product) => product.status === "end").length,
    products.filter((product) => product.status === "soon-expired").length,
    products.filter((product) => product.status === "expired").length,
  ];
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 200);

  return (
    <DefaultPageLayout
      title="Склад"
      subtitle="Управление складом и остатками продуктов"
      searchTitle="Поиск продуктов по названию"
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      statisticData={storeStatisticData.map((item, index) => ({
        ...item,
        value: counts[index],
      }))}
    >
      <TableSummary
        count={
          products.filter((product) =>
            matchesStoreProduct(product, debouncedSearchValue),
          ).length
        }
        description="На текущий момент"
        action={
          <Button
            component={Link}
            to="/store/inventory"
            size="lg"
            leftSection={<IconClipboardCheck size={20} />}
          >
            Провести инвентаризацию
          </Button>
        }
      />
      <StoreTableSection searchValue={debouncedSearchValue} />
    </DefaultPageLayout>
  );
}
