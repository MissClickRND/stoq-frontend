import { createElement, useState } from "react";
import { Alert, Button, Center, Loader, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import {
  useDishes,
  useStopList,
  useDishRecommendations,
  matchesDish,
} from "@/entities/dish";
import { dishModes, dishStatisticItems } from "../model/config";

import { AllDishes } from "./components/allDishes/AllDishes";
import { StopList } from "./components/stopList/StopList";
import { Recommendation } from "./components/Recomendtation/Recomendtation";
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
  const { dishes, isLoading, isError, refetch } = useDishes("", {
    skip: mode !== "all",
  });
  const stopList = useStopList();
  const recommendations = useDishRecommendations();
  const source = mode === "stop" ? stopList : recommendations;
  const visibleDishes = (mode === "all" ? dishes : source.dishes).filter(
    (dish) => !dish.archived && matchesDish(dish, query),
  );
  //! Подключить статистику отдельно, когда API начнёт отдавать доступность.
  const counts = {
    total: dishes.filter((dish) => !dish.archived).length,
    active: 0,
    stopped: 0,
    missing: 0,
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
        searchTitle="Поиск блюд по названию или ингридиентам"
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        statisticData={statistics}
        topSection={{
          items: dishModes,
          value: mode,
          onChange: (value) => setParams({ mode: value }),
          ariaLabel: "Режим отображения блюд",
        }}
      >
        {mode !== "all" && !source.isAvailable && (
          <Text c="dimmed">
            {mode === "stop"
              ? "Стоп-лист пока недоступен."
              : "Рекомендации пока недоступны."}
          </Text>
        )}
        {mode === "all" && isLoading && (
          <Center w="100%" h="100%">
            <Loader />
          </Center>
        )}
        {mode === "all" && isError && (
          <Alert color="red" role="alert">
            Не удалось загрузить блюда.
            <Button type="button" variant="subtle" onClick={() => refetch()}>
              Повторить
            </Button>
          </Alert>
        )}
        <TableSummary
          count={visibleDishes.length}
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
        {mode === "all" ? (
          <AllDishes dishes={visibleDishes} />
        ) : mode === "stop" ? (
          <StopList dishes={visibleDishes} />
        ) : (
          <Recommendation dishes={visibleDishes} />
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
