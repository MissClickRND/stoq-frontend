import DefaultPageLayout from "@/widgets/default-page-layout";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import StoreTableSection from "./components/StoreTableSection";
import { storeStatisticData } from "../model/config";
import { ActionIcon, Button, Group, Tooltip } from "@mantine/core";
import { TableSummary } from "@/shared/ui/table-summary";
import { useGetStoreQuery, getShelfLifeDays, soonExpiredDays } from "@/entities/store";
import { IconClipboardCheck, IconCubePlus } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useStartInventory } from "@/features/inventory";
import { CreateProductModal } from "@/widgets/create-product-modal";

export default function StorePage() {
  const [opened, { open, close }] = useDisclosure(false);
  const startInventory = useStartInventory();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 200);
  const search = debouncedSearchValue.trim();
  const all = useGetStoreQuery({ search: "" });
  const filtered = useGetStoreQuery({ search }, { skip: !search });
  const listing = search ? filtered : all;
  const products = listing.currentData ?? [];
  const counts = [
    all.currentData?.length ?? 0,
    all.currentData?.filter((product) => product.status === "DEPLETED").length ?? 0,
    all.currentData?.filter((product) => {
      const days = getShelfLifeDays(product.expiresAt);
      return Date.parse(product.expiresAt) > Date.now() && days !== null && days < soonExpiredDays;
    }).length ?? 0,
    all.currentData?.filter((product) => Date.parse(product.expiresAt) <= Date.now()).length ?? 0,
  ];

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
          count={products.length}
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
        <StoreTableSection
          products={products}
          isLoading={!listing.currentData && listing.isFetching}
          isError={listing.isError}
          onRetry={() => listing.refetch()}
        />
      </DefaultPageLayout>
    </>
  );
}
