import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconChefHat } from "@tabler/icons-react";
import type { Dish } from "@/entities/dish";
import { formatOrderMoney } from "@/entities/order";
import { CatalogSearch } from "@/shared/ui/catalog-search";
export function OrderDishSearch({
  dishes,
  onSelect,
}: {
  dishes: Dish[];
  onSelect: (dish: Dish) => void;
}) {
  return (
    <CatalogSearch
      items={dishes}
      getId={(dish) => dish.id}
      getSearchText={(dish) =>
        [
          dish.name,
          dish.description,
          ...dish.ingredients.map((item) => item.name),
        ].join(" ")
      }
      onSelect={onSelect}
      label="Добавить блюдо"
      placeholder="Начните вводить название блюда или ингредиента"
      emptyText="Блюда не найдены"
      renderOption={(dish) => (
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon variant="light" size={38}>
              <IconChefHat size={22} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={600}>
                {dish.name}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {dish.description}
              </Text>
            </div>
          </Group>
          <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
            {formatOrderMoney(dish.price)}
          </Text>
        </Group>
      )}
    />
  );
}
