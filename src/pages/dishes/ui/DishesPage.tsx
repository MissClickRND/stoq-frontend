import { createElement, useState } from "react";
import { Alert, Button, Center, Loader } from "@mantine/core";
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
import { Recommendation } from "./components/Recomendtation/Recomendtation";
import { DishFormModal } from "@/features/dish-form";
import { DishIngredientSearch } from "./components/DishIngredientSearch";
import { TableSummary } from "@/shared/ui/table-summary";
import { useGetDishStatisticQuery } from "@/entities/statistic";
import { DependencyGraph } from "@/widgets/dependency-graph";

export function DishesPage() {
  const [searchValue, setSearchValue] = useState("");
  const { data } = useGetDishStatisticQuery();

  const [query] = useDebouncedValue(searchValue, 200);
  const [adding, setAdding] = useState(false);
  const [params, setParams] = useSearchParams();
  const requestedMode = params.get("mode");
  const mode =
    requestedMode === "stop" ||
    requestedMode === "recommended" ||
    requestedMode === "graph"
      ? requestedMode
      : "all";
  const search = query.trim();
  const allDishes = useGetDishesQuery(
    { search },
    {
      skip: mode !== "all",
    },
  );

  const stopList = useStopList(search, { skip: mode !== "stop" });
  const recommendations = useDishRecommendations({
    skip: mode !== "recommended",
  });
  const activeQuery =
    mode === "all" ? allDishes : mode === "stop" ? stopList : recommendations;
  const isDishTable = mode !== "graph";
  const isLoading =
    isDishTable &&
    (activeQuery.isLoading ||
      (activeQuery.isFetching && !activeQuery.currentData));
  const isError = isDishTable && activeQuery.isError;
  const count =
    mode === "all"
      ? (allDishes.currentData?.length ?? 0)
      : mode === "stop"
        ? stopList.dishes.length
        : recommendations.dishes.length;

  const counts = {
    total: data?.total,
    active: data?.active,
    stopped: data?.stopList,
    missing: data?.lowStock,
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
        disableSearch={mode === "recommended" || mode === "graph"}
        disableStatistics={mode === "graph"}
        statisticData={statistics}
        topSection={{
          items: dishModes,
          value: mode,
          onChange: (value) => setParams({ mode: value }),
          ariaLabel: "Режим отображения блюд",
        }}
      >
        {isError && (
          <Alert color="red" role="alert">
            {mode === "stop"
              ? "Не удалось загрузить стоп-лист."
              : mode === "recommended"
                ? "Не удалось загрузить рекомендации."
                : "Не удалось загрузить блюда."}
            {mode !== "all" &&
              activeQuery.error &&
              typeof activeQuery.error === "string" && (
                <div>{activeQuery.error}</div>
              )}
            <Button
              type="button"
              variant="subtle"
              onClick={() => activeQuery.refetch()}
            >
              Повторить
            </Button>
          </Alert>
        )}
        {mode === "graph" ? (
          <DependencyGraph />
        ) : (
          <>
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
            {isLoading && (
              <Center
                w="100%"
                h="100%"
                role="status"
                aria-label="Загрузка блюд"
              >
                <Loader />
              </Center>
            )}
            {!isLoading &&
              !isError &&
              (mode === "all" ? (
                <AllDishes dishes={allDishes.currentData ?? []} />
              ) : mode === "stop" ? (
                <StopList stopListDishes={stopList.dishes} />
              ) : (
                <Recommendation dishes={recommendations.dishes} />
              ))}
          </>
        )}
      </DefaultPageLayout>
      <DishFormModal
        opened={adding}
        onClose={() => setAdding(false)}
        renderIngredientSearch={(props) => <DishIngredientSearch {...props} />}
      />
    </>
  );
}
