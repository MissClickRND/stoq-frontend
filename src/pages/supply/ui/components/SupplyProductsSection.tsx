import {
  Badge,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";
import type { SupplyItemDraft, SupplyProduct } from "../../model/type";
import { SupplyProductCard } from "./SupplyProductCard";
import { SupplyProductSearch } from "./SupplyProductSearch";
import classes from "./SupplyForm.module.css";

export function SupplyProductsSection({
  items,
  units,
  receivedAt,
  submitted,
  onSelect,
  onChange,
  onRemove,
  onAddUnit,
}: {
  items: SupplyItemDraft[];
  units: string[];
  receivedAt: string | null;
  submitted: boolean;
  onSelect: (product: SupplyProduct) => void;
  onChange: (id: string, patch: Partial<SupplyItemDraft>) => void;
  onRemove: (id: string) => void;
  onAddUnit: (id: string) => void;
}) {
  return (
    <Paper withBorder p="lg" className={classes.productsSection}>
      <Stack gap="md">
        <Group gap="sm">
          <Title order={3} size="h4">
            Продукты в поставке
          </Title>
          <Badge size="lg" variant="light" color="gray" tt="none">
            Позиций: {items.length}
          </Badge>
        </Group>
        <SupplyProductSearch onSelect={onSelect} />
        {items.length ? (
          <>
            <ScrollArea type="auto" offsetScrollbars>
              <div className={classes.productsList}>
                <div className={classes.productColumns} aria-hidden="true">
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
            <Text size="sm" c="dimmed">
              Цена и сумма пересчитываются автоматически. Для разных сроков
              годности добавьте продукт отдельными позициями.
            </Text>
          </>
        ) : (
          <Stack align="center" gap="xs" py="xl">
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
