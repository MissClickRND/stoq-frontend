import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";
import { useProducts, type Product } from "@/entities/product";
import { CatalogSearch } from "@/shared/ui/catalog-search";
export function SupplyProductSearch({
  onSelect,
}: {
  onSelect: (product: Product) => void;
}) {
  const { products } = useProducts();
  return (
    <CatalogSearch
      items={products}
      getId={(product) => product.id}
      getSearchText={(product) => product.title + " " + product.article}
      onSelect={onSelect}
      placeholder="Начните вводить название или артикул"
      emptyText="Продукты не найдены"
      renderOption={(product) => (
        <Group gap="sm">
          <ThemeIcon variant="light" size={32}>
            <IconPackage size={18} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={600}>
              {product.title}
            </Text>
            <Text size="sm" c="dimmed">
              Артикул {product.article} · {product.unit}
            </Text>
          </div>
        </Group>
      )}
    />
  );
}
