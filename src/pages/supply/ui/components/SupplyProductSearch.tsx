import { Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";
import { useProducts, type Product } from "@/entities/product";
import { CatalogSearch } from "@/shared/ui/catalog-search";
export function SupplyProductSearch({
  onSelect,
  onCreate,
}: {
  onSelect: (product: Product) => void;
  onCreate: (name: string) => void;
}) {
  const { products } = useProducts();
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <CatalogSearch
      items={products}
      attached
      renderEmpty={(search) => (
        <Stack align="center" gap="sm" p="md">
          <Text size="lg" c="dimmed">
            Продукт не найден
          </Text>
          <Button
            type="button"
            size="lg"
            variant="light"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onCreate(search)}
          >
            Создать продукт
          </Button>
        </Stack>
      )}
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
