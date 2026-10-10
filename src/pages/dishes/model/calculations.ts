import type { Dish, DishIngredient } from "./type";

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
export const dishCost = (dish: Dish) =>
  dish.ingredients.reduce(
    (sum, ingredient) => sum + ingredient.quantity * ingredient.costPerUnit,
    0,
  );
export const dishProfit = (dish: Dish) => dish.price - dishCost(dish);
export const dishMarkup = (dish: Dish) =>
  dishCost(dish) > 0 ? (dishProfit(dish) / dishCost(dish)) * 100 : null;
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const isIngredientExpired = (ingredient: DishIngredient) =>
  ingredient.expiresOn < today();
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
  `${dish.name} ${dish.description} ${dish.ingredients.map((item) => item.name).join(" ")} ${unavailableReason(dish)} ${dish.recommendation?.reason ?? ""}`
    .toLocaleLowerCase("ru-RU")
    .includes(query.trim().toLocaleLowerCase("ru-RU"));
