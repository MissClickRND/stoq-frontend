import { useMemo } from "react";
import { useGetProductsQuery } from "../../product/@x/dish";
import { useGetStoreQuery } from "../../store/@x/dish";
import { toCreateDishRequest, toDish, toDishIngredient } from "../lib/adapters";
import type { DishFormValues } from "../model/view";
import {
  useCreateDishMutation,
  useGetDishByIdQuery,
  useGetDishesQuery,
} from "./dish";

export function useDishes(search = "", options?: { skip?: boolean }) {
  const query = useGetDishesQuery({ search }, options);
  const dishes = useMemo(
    () => query.currentData?.map(toDish) ?? [],
    [query.currentData],
  );
  return { ...query, dishes };
}

export function useSaveDish() {
  const [createDish, mutation] = useCreateDishMutation();
  const saveDish = async (draft: DishFormValues, id?: string) => {
    if (id) {
      //! Подключить обновление блюда, когда операция появится в API.
      return undefined;
    }
    const saved = await createDish(toCreateDishRequest(draft)).unwrap();
    return toDish(saved);
  };
  return {
    saveDish,
    isSaving: mutation.isLoading,
  };
}

export function useDish(id?: string) {
  const numericId = Number(id);
  const query = useGetDishByIdQuery(
    { id: numericId },
    { skip: !Number.isSafeInteger(numericId) || numericId <= 0 },
  );
  const dish = useMemo(
    () => (query.currentData ? toDish(query.currentData) : undefined),
    [query.currentData],
  );
  return {
    ...query,
    dish,
    isLoading: query.isLoading || (query.isFetching && !query.currentData),
  };
}

export function useIngredients() {
  const query = useGetProductsQuery({ search: "" });
  const warehouse = useGetStoreQuery({ search: "" }, { refetchOnMountOrArgChange: true });
  const ingredients = useMemo(
    () =>
      query.data
        ?.filter((product) => !product.isDeleted)
        .map((product) => {
          const batches = (warehouse.data ?? []).filter((batch) => batch.productId === product.id && batch.status === 'ACTIVE'
            && new Date(batch.expiresAt).getTime() > Date.now() && batch.Quantity > 0);
          const stock = batches.reduce((sum, batch) => sum + batch.Quantity, 0);
          return { ...toDishIngredient(product), stock,
            costPerUnit: stock > 0 && batches.every((batch) => batch.price != null)
              ? batches.reduce((sum, batch) => sum + batch.Quantity * batch.price!, 0) / stock : null,
            expiresOn: batches.map((batch) => batch.expiresAt).sort()[0]?.slice(0, 10) ?? '' };
        }) ?? [],
    [query.data, warehouse.data],
  );
  return { ...query, ingredients, isLoading: query.isLoading || warehouse.isLoading,
    isError: query.isError || warehouse.isError, refetch: () => { void query.refetch(); void warehouse.refetch(); } };
}
