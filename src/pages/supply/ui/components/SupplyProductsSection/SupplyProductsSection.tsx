import type { IUnit } from "@/entities/unit";
import componentClasses from "./SupplyProductsSection.module.css";
import {
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";
import type { SupplyItemDraft, Product } from "@/entities/supply";
import { SupplyProductCard } from "../SupplyProductCard/SupplyProductCard";
import { SupplyProductSearch } from "../SupplyProductSearch";

export function SupplyProductsSection({
  items,
  units,
  receivedAt,
  submitted,
  onSelect,
  onCreateProduct,
  onChange,
  onRemove,
  onAddUnit,
}: {
  items: SupplyItemDraft[];
  units: IUnit[];
  receivedAt: string | null;
  submitted: boolean;
  onSelect: (product: Product) => void;
  onCreateProduct: (name: string) => void;
  onChange: (id: string, patch: Partial<SupplyItemDraft>) => void;
  onRemove: (id: string) => void;
  onAddUnit: (id: string) => void;
}) {
  return (
    <Paper withBorder p="lg" className={componentClasses.productsSection}>
      <Stack gap="md" className={componentClasses.productsContent}>
        <Group
          gap="sm"
          justify="space-between"
          className={componentClasses.fixed}
        >
          <Title order={3} size="h4">
            Продукты в поставке
          </Title>
        </Group>
        <div className={componentClasses.fixed}>
          <SupplyProductSearch onSelect={onSelect} onCreate={onCreateProduct} />
        </div>
        {items.length ? (
          <>
            <ScrollArea
              type="auto"
              offsetScrollbars
              className={componentClasses.productsScroll}
              classNames={{ viewport: componentClasses.productsViewport }}
            >
              <div className={componentClasses.productsList}>
                <div
                  className={componentClasses.productColumns}
                  aria-hidden="true"
                >
                  {[
                    "Продукт",
                    "Количество",
                    "Ед. измерения",
                    "Срок годности",
                    "Цена за ед.",
                    "Сумма",
                    "",
                  ].map((label, index) => (
                    <Text key={index} size="lg" fw={600} c="dimmed">
                      {label}
                    </Text>
                  ))}
                </div>
                <Stack gap="xs">
                  {items.map((item) => (
                    <div key={item.id} id={`supply-item-${item.id}`}>
                      <SupplyProductCard
                        item={item}
                        units={units}
                        receivedAt={receivedAt}
                        submitted={submitted}
                        onChange={(patch) => onChange(item.id, patch)}
                        onRemove={() => onRemove(item.id)}
                        onAddUnit={() => onAddUnit(item.id)}
                      />
                    </div>
                  ))}
                </Stack>
              </div>
            </ScrollArea>
          </>
        ) : (
          <Stack
            align="center"
            gap="xs"
            py="xl"
            className={componentClasses.emptyProducts}
          >
            <ThemeIcon size={60} radius="xl" variant="light" color="gray">
              <IconPackage size={30} stroke={1.5} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              Добавьте первый продукт
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={420}>
              Выберите продукт в поиске выше, затем укажите количество, срок
              годности и стоимость.
            </Text>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
