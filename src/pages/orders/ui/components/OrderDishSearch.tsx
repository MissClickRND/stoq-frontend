import type { Dish } from "@/entities/dish";
import { CatalogSearch } from "@/widgets/catalog-search";

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
      renderOption={(dish) => dish.name}
      onSelect={onSelect}
      label="Добавить блюдо"
      placeholder="Начните вводить название блюда или ингредиента"
      emptyText="Блюда не найдены"
    />
  );
}
