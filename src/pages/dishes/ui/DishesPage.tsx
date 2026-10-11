import { createElement, useState } from "react";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useDishes } from "../model/DishesProvider";
import { dishModes, dishStatisticItems, priorityLabels } from "../model/data";
import {
  dishIsStopped,
  matchesDish,
  missingIngredients,
} from "../model/calculations";
import { AllDishes } from "./components/allDishes/AllDishes";
import { StopList } from "./components/stopList/StopList";
import { Recomendtation } from "./components/Recomendtation/Recomendtation";
import { DishFormModal } from "./components/form/DishFormModal";
import { TableSummary } from "@/shared/ui/table-summary";

export function DishesPage() {
  const { dishes } = useDishes();
  const [searchValue, setSearchValue] = useState("");
  const [query] = useDebouncedValue(searchValue, 200);
  const [adding, setAdding] = useState(false);
  const [params, setParams] = useSearchParams();
  const requestedMode = params.get("mode");
  const mode =
    requestedMode === "stop" || requestedMode === "recommended"
      ? requestedMode
      : "all";
  const matching = dishes.filter((dish) => matchesDish(dish, query));
  const menuDishes = dishes.filter((dish) => !dish.archived);
  const stopped = dishes.filter(dishIsStopped);
  const counts = {
    total: menuDishes.length,
    active: menuDishes.length - stopped.length,
    stopped: stopped.length,
    missing: menuDishes.filter((dish) => missingIngredients(dish).length > 0)
      .length,
  };
  const statistics = dishStatisticItems.map((item) => ({
    title: item.title,
    description: item.description,
    value: counts[item.key],
    color: item.color,
    icon: createElement(item.icon),
  }));
  const recommendations = matching
    .filter((dish) => !dish.archived && dish.recommendation)
    .sort(
      (a, b) =>
        priorityLabels[a.recommendation!.priority].rank -
        priorityLabels[b.recommendation!.priority].rank,
    );
  const visibleDishes =
    mode === "stop"
      ? matching.filter(dishIsStopped)
      : mode === "recommended"
        ? recommendations
        : matching;

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
          <Recomendtation dishes={visibleDishes} />
        )}
      </DefaultPageLayout>
      <DishFormModal opened={adding} onClose={() => setAdding(false)} />
    </>
  );
}
