import type { IngredientSearchProps } from "@/features/dish-form";
import { CatalogSearch } from "@/widgets/catalog-search";

export function DishIngredientSearch(props: IngredientSearchProps) {
  return (
    <CatalogSearch
      {...props}
      getId={(ingredient) => ingredient.id}
      getSearchText={(ingredient) => ingredient.name}
      label="Ингредиенты"
      placeholder="Начните вводить название ингредиента"
      description="Выберите ингредиент из подсказок, чтобы добавить его в состав"
      withAsterisk
      emptyText="Ингредиенты не найдены"
    />
  );
}
