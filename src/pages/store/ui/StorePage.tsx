import DefaultPageLayout from "@/widgets/default-page-layout";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import StoreTableSection from "./components/StoreTableSection";
import { storeStatisticData } from "../model/config";
import { ActionIcon, Button, Group, Tooltip } from "@mantine/core";
import { TableSummary } from "@/shared/ui/table-summary";
import { matchesStoreProduct, useStoreProducts } from "@/entities/stock";
import { IconClipboardCheck, IconCubePlus } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useStartInventory } from "@/features/inventory";
import { CreateProductModal } from "@/widgets/create-product-modal";

export default function StorePage() {
  const { products } = useStoreProducts();

  const [opened, { open, close }] = useDisclosure(false);
  const startInventory = useStartInventory();
  const counts = [
    products.length,
    products.filter((product) => product.status === "end").length,
    products.filter((product) => product.status === "soon-expired").length,
    products.filter((product) => product.status === "expired").length,
  ];
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 200);

  return (
    <>
      <CreateProductModal opened={opened} onClose={close} />
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
            <Group gap="md">
              <Tooltip label="Создать продукт">
                <ActionIcon
                  type="button"
                  size={50}
                  aria-label="Создать продукт"
                  onClick={() => open()}
                >
                  <IconCubePlus size={20} />
                </ActionIcon>
              </Tooltip>
              <Button
                component={Link}
                to="/store/inventory"
                onClick={startInventory}
                size="lg"
                leftSection={<IconClipboardCheck size={20} />}
              >
                Провести инвентаризацию
              </Button>
            </Group>
          }
        />
        <StoreTableSection searchValue={debouncedSearchValue} />
      </DefaultPageLayout>
    </>
  );
}
