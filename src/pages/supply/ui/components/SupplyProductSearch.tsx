import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Button, Stack, Text } from "@mantine/core";
import { useGetProductsQuery, type IProduct } from "@/entities/product";
import { CatalogSearch } from "@/widgets/catalog-search";

export function SupplyProductSearch({
  onSelect,
  onCreate,
}: {
  onSelect: (product: IProduct) => void;
  onCreate: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [query] = useDebouncedValue(search.trim(), 200);
  const {
    currentData: products = [],
    isFetching,
    isError,
    refetch,
  } = useGetProductsQuery({ search: query });
  return (
    <CatalogSearch
      items={products}
      onSearchChange={setSearch}
      filterLocally={false}
      loading={isFetching || query !== search.trim()}
      queryError={
        isError ? (
          <>
            Не удалось загрузить продукты.{" "}
            <Button
              type="button"
              variant="subtle"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => refetch()}
            >
              Повторить
            </Button>
          </>
        ) : undefined
      }
      renderEmpty={(name) => (
        <Stack align="center" gap="sm" p="md">
          <Text size="lg" c="dimmed">
            Продукт не найден
          </Text>
          <Button
            type="button"
            size="lg"
            variant="light"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onCreate(name)}
          >
            Создать продукт
          </Button>
        </Stack>
      )}
      getId={(product) => String(product.id)}
      getSearchText={(product) => product.name}
      onSelect={onSelect}
      placeholder="Начните вводить название продукта"
      emptyText="Продукты не найдены"
    />
  );
}
