import type { Dish } from "../model/type.ts";
import { useGetStopListDishesQuery } from "./dish";

const recommendations: Dish[] = [];

export function useStopList(search = "", options?: { skip?: boolean }) {
  const query = useGetStopListDishesQuery({ search }, options);
  return {
    ...query,
    dishes: query.currentData ?? [],
    isLoading: query.isLoading || (query.isFetching && !query.currentData),
  };
}

export function useDishRecommendations() {
  //! Подключить отдельный запрос рекомендаций, когда он появится в API.
  return { dishes: recommendations, isAvailable: false };
}
