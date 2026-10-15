import type { Dish, IRecommendedDishes } from "../model/type.ts";
import { dishCanBeOrdered } from "./calculations.ts";

export const GUEST_MENU_PAGE_SIZE = 12;

export function getGuestMenuDishes<T extends Dish>(
  dishes: T[],
  recommendations: IRecommendedDishes[],
) {
  const available = dishes.filter(dishCanBeOrdered);
  const catalog = new Map(available.map((dish) => [dish.id, dish]));
  const selected = new Set<string>();
  const first: T[] = [];
  for (const recommendation of recommendations) {
    const dish = catalog.get(String(recommendation.dishId));
    if (!dish || selected.has(dish.id)) continue;
    selected.add(dish.id);
    first.push(dish);
    if (first.length === 10) break;
  }
  return [...first, ...available.filter((dish) => !selected.has(dish.id))];
}
