import { createElement, useState } from "react";
import { Alert, Button, Center, Loader, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import {
  useGetDishesQuery,
  useStopList,
  useDishRecommendations,
} from "@/entities/dish";
import { dishModes, dishStatisticItems } from "../model/config";

import { AllDishes } from "./components/allDishes/AllDishes";
import { StopList } from "./components/stopList/StopList";
import { Recommendation } from "./components/recomendtation/Recomendtation";
import { DishFormModal } from "@/features/dish-form";
import { DishIngredientSearch } from "./components/DishIngredientSearch";
import { TableSummary } from "@/shared/ui/table-summary";

export function DishesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [query] = useDebouncedValue(searchValue, 200);
  const [adding, setAdding] = useState(false);
  const [params, setParams] = useSearchParams();
  const requestedMode = params.get("mode");
  const mode =
    requestedMode === "stop" || requestedMode === "recommended"
      ? requestedMode
      : "all";
  const search = query.trim();
  const allDishes = useGetDishesQuery({ search }, {
    skip: mode !== "all",
  });
  const stopList = useStopList(search, { skip: mode !== "stop" });
  const recommendations = useDishRecommendations();
  const activeQuery = mode === "all" ? allDishes : stopList;
  const isLoading = mode !== "recommended" && (
    activeQuery.isLoading || (activeQuery.isFetching && !activeQuery.currentData)
  );
  const isError = mode !== "recommended" && activeQuery.isError;
  const count = mode === "all" ? allDishes.currentData?.length ?? 0
    : mode === "stop" ? stopList.dishes.length : recommendations.dishes.length;
  const catalog = mode === "all" && !search && !isError ? allDishes.currentData : undefined;
  const stopped = mode === "stop" && !search && !isError ? stopList.currentData : undefined;
  const counts = {
    total: catalog?.length ?? "—",
    active: catalog?.filter((dish) => dish.availablePortions > 0).length ?? "—",
    stopped: stopped?.length ?? catalog?.filter((dish) => dish.availablePortions === 0).length ?? "—",
    missing: stopped?.filter((dish) => dish.reasons.some((reason) => reason.status === "INSUFFICIENT_STOCK")).length
      ?? catalog?.filter((dish) => dish.recipeItems.some((item) => item.portions === 0)).length ?? "—",
  };
  const statistics = dishStatisticItems.map((item) => ({
    title: item.title,
    description: item.description,
    value: counts[item.key],
    color: item.color,
    icon: createElement(item.icon),
  }));

  return (
    <>
      <DefaultPageLayout
        title="Блюда"
        subtitle="Управление меню, составами и стоимостью блюд"
        searchTitle="Поиск блюд по названию"
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        disableSearch={mode === "recommended"}
        statisticData={statistics}
        topSection={{
          items: dishModes,
          value: mode,
          onChange: (value) => setParams({ mode: value }),
          ariaLabel: "Режим отображения блюд",
        }}
      >
        {mode === "recommended" && !recommendations.isAvailable && (
          <Text c="dimmed">Рекомендации пока недоступны.</Text>
        )}
        {isLoading && (
          <Center w="100%" h="100%" role="status" aria-label="Загрузка блюд">
            <Loader />
          </Center>
        )}
        {isError && (
          <Alert color="red" role="alert">
            {mode === "stop" ? "Не удалось загрузить стоп-лист." : "Не удалось загрузить блюда."}
            <Button type="button" variant="subtle" onClick={() => activeQuery.refetch()}>
              Повторить
            </Button>
          </Alert>
        )}
        <TableSummary
          count={count}
          description="Блюд в текущей таблице"
          action={
            <Button
              size="lg"
              leftSection={<IconPlus size={20} />}
              onClick={() => setAdding(true)}
            >
              Добавить блюдо
            </Button>
          }
        />
        {!isLoading && !isError && (mode === "all" ? (
          <AllDishes dishes={allDishes.currentData ?? []} />
        ) : mode === "stop" ? (
          <StopList stopListDishes={stopList.dishes} />
        ) : (
          <Recommendation dishes={recommendations.dishes} />
        ))}
      </DefaultPageLayout>
      <DishFormModal
        opened={adding}
        onClose={() => setAdding(false)}
        renderIngredientSearch={(props) => <DishIngredientSearch {...props} />}
      />
    </>
  );
}
