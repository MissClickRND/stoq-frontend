import type { Dish } from "@/entities/dish";
import type { ReactNode } from "react";
import { CatalogSearch } from "@/widgets/catalog-search";

export function OrderDishSearch({
  dishes,
  onSelect,
  loading,
  queryError,
}: {
  dishes: Dish[];
  onSelect: (dish: Dish) => void;
  loading?: boolean;
  queryError?: ReactNode;
}) {
  return (
    <CatalogSearch
      items={dishes}
      loading={loading}
      queryError={queryError}
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
