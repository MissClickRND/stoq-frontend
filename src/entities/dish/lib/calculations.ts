import type { Dish, DishIngredient } from "../model/view.ts";

export const formatMoney = (value: number | null) => value == null ? "—" : formatCurrency(value, 2);
export const dishCost = (dish: Dish) =>
  dish.ingredients.some((item) => item.costPerUnit == null) ? null : dish.ingredients.reduce(
    (sum, ingredient) => sum + ingredient.quantity * ingredient.costPerUnit!,
    0,
  );
export const dishProfit = (dish: Dish) => {
  const cost = dishCost(dish);
  return cost == null ? null : dish.price - cost;
};
export const dishMarkup = (dish: Dish) => {
  const cost = dishCost(dish);
  return cost != null && cost > 0 ? ((dish.price - cost) / cost) * 100 : null;
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const isIngredientExpired = (ingredient: DishIngredient) =>
  Boolean(ingredient.expiresOn) && ingredient.expiresOn < today();
export const missingIngredients = (dish: Dish) =>
  dish.ingredients.filter(
    (item) => item.stock < item.quantity || isIngredientExpired(item),
  );
export const dishIsStopped = (dish: Dish) =>
  !dish.archived && (dish.stopped || missingIngredients(dish).length > 0);
export const unavailableReason = (dish: Dish) =>
  dish.stopReason ||
  missingIngredients(dish)
    .map(
      (item) =>
        `${item.name}: ${isIngredientExpired(item) ? "истёк срок годности" : "недостаточно на складе"}`,
    )
    .join("; ") ||
  (dish.stopped ? "Продажи приостановлены вручную" : "");
export const ingredientPortions = (ingredient: DishIngredient) =>
  ingredient.quantity > 0 && !isIngredientExpired(ingredient)
    ? Math.floor(ingredient.stock / ingredient.quantity + 1e-9)
    : 0;

export const dishPortions = (dish: Dish) =>
  dish.ingredients.length
    ? Math.min(...dish.ingredients.map((item) => ingredientPortions(item)))
    : 0;
export const matchesDish = (dish: Dish, query: string) =>
  `${dish.name} ${dish.category ?? ""} ${dish.description} ${dish.ingredients.map((item) => item.name).join(" ")} ${unavailableReason(dish)} ${dish.recommendation?.reason ?? ""}`
    .toLocaleLowerCase("ru-RU")
    .includes(query.trim().toLocaleLowerCase("ru-RU"));

import { formatCurrency } from "../../../shared/lib/format.ts";
