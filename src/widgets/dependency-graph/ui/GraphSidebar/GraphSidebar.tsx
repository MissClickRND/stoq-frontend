import {
  Badge,
  Group,
  SegmentedControl,
  Switch,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import type { DependencyGraph } from "@/entities/dependency-graph";
import {
  getExplorerDishes,
  type ExplorerDish,
  type GraphViewMode,
} from "../../model/explorer";
import { statusPresentation } from "../../model/config";
import { DishComposition } from "../DishComposition/DishComposition";
import classes from "./GraphSidebar.module.css";

type GraphSidebarProps = {
  graph: DependencyGraph;
  mode: GraphViewMode;
  selectedDish?: ExplorerDish;
  onModeChange: (mode: GraphViewMode) => void;
  onSelectDish: (id: string) => void;
  disabled: boolean;
};

export function GraphSidebar({
  graph,
  mode,
  selectedDish,
  onModeChange,
  onSelectDish,
  disabled,
}: GraphSidebarProps) {
  const [search, setSearch] = useState("");

  const dishes = getExplorerDishes(graph, search);

  return (
    <aside className={classes.sidebar} aria-label="Выбор блюда для анализа">
      <div className={classes.filters}>
        <SegmentedControl
          fullWidth
          value={mode}
          onChange={(value) => onModeChange(value as GraphViewMode)}
          data={[
            { value: "dish", label: "По блюду" },
            { value: "all", label: "Вся карта" },
          ]}
          aria-label="Режим просмотра графа"
          disabled={disabled}
        />
        <TextInput
          placeholder="Найти блюдо"
          aria-label="Поиск блюда в списке"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          disabled={disabled}
        />

        <Group justify="space-between">
          <Text size="xs" fw={600} c="dimmed">
            БЛЮДА
          </Text>
          <Badge size="sm" variant="light" color="gray">
            {dishes.length}
          </Badge>
        </Group>
      </div>

      <div
        className={`${classes.dishList} ${mode === "all" || !selectedDish ? classes.expanded : ""}`}
      >
        {dishes.length ? (
          <ul className={classes.list}>
            {dishes.map((dish) => {
              const status = statusPresentation[dish.data.status];
              const selected = mode === "dish" && selectedDish?.id === dish.id;
              return (
                <li key={dish.id}>
                  <UnstyledButton
                    className={classes.dish}
                    data-selected={selected || undefined}
                    aria-pressed={selected}
                    aria-label={`Показать связи блюда ${dish.data.name}`}
                    onClick={() => onSelectDish(dish.id)}
                    disabled={disabled}
                  >
                    <span
                      className={classes.dot}
                      style={{ background: status.color }}
                    />
                    <span className={classes.dishInfo}>
                      <Text size="sm" fw={selected ? 600 : 500}>
                        {dish.data.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {status.dishLabel}
                      </Text>
                    </span>
                  </UnstyledButton>
                </li>
              );
            })}
          </ul>
        ) : (
          <Text size="sm" c="dimmed" className={classes.empty}>
            {search || "Блюд пока нет"}
          </Text>
        )}
      </div>

      {mode === "dish" && selectedDish && (
        <DishComposition graph={graph} dish={selectedDish} />
      )}
      {mode === "all" && (
        <Text size="xs" c="dimmed" className={classes.hint}>
          Выберите блюдо в списке или на карте, чтобы разобрать его состав.
        </Text>
      )}
    </aside>
  );
}
