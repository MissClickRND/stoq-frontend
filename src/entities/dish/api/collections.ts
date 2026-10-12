import type { Dish } from "../model/view.ts";

const stopList: Dish[] = [];
const recommendations: Dish[] = [];

export function useStopList() {
  //! Подключить отдельный запрос стоп-листа, когда он появится в API.
  return { dishes: stopList, isAvailable: false };
}

export function useDishRecommendations() {
  //! Подключить отдельный запрос рекомендаций, когда он появится в API.
  return { dishes: recommendations, isAvailable: false };
}
