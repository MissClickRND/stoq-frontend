import {
  ActionIcon,
  Button,
  Loader,
  Group,
  Text,
  TextInput,
  Tooltip,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconArrowsMaximize,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTopologyStar3,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDependencyGraph } from "@/entities/dependency-graph";
import { useDependencyFlow } from "../../model/useDependencyFlow";
import { statusPresentation } from "../../model/config";
import type { FlowNode } from "../../model/type";
import { GraphNode } from "../GraphNode/GraphNode";
import { RecipeConnection } from "../RecipeConnection/RecipeConnection";
import { GraphSidebar } from "../GraphSidebar/GraphSidebar";
import {
  getDishGraph,
  getExplorerDishes,
  type GraphViewMode,
} from "../../model/explorer";
import classes from "./DependencyGraph.module.css";
import { apiErrorMessage } from "@/shared/lib/api-error";

const nodeTypes = { ingredient: GraphNode, dish: GraphNode };
const edgeTypes = { recipe: RecipeConnection };
const legendStatuses = ["available", "low_stock", "unavailable"] as const;

export function DependencyGraph() {
  const { graph, isLoading, isFetching, isError, error, refetch } =
    useDependencyGraph();
  const colorMode = useComputedColorScheme("light");
  const [mode, setMode] = useState<GraphViewMode>("dish");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dishes = useMemo(() => getExplorerDishes(graph), [graph]);
  useEffect(() => {
    if (selectedId === null && dishes[0]) setSelectedId(dishes[0].id);
  }, [selectedId, dishes]);
  const selectedDish =
    selectedId === null
      ? dishes[0]
      : dishes.find((dish) => dish.id === selectedId);
  const selectedDishId = selectedDish?.id ?? null;
  const visibleGraph = useMemo(
    () => (mode === "all" ? graph : getDishGraph(graph, selectedDishId)),
    [graph, mode, selectedDishId],
  );
  const selectDish = useCallback((id: string) => {
    setSelectedId(id);
    setMode("dish");
  }, []);
  const flow = useDependencyFlow(visibleGraph, colorMode, {
    detailed: mode === "dish",
    onSelectDish: selectDish,
  });
  useEffect(() => {
    if (mode === "dish") flow.setSearch("");
  }, [mode, flow.setSearch]);
  const controls = [
    {
      label: "Обновить граф",
      icon: IconRefresh,
      action: () => {
        void refetch();
      },
    },
    {
      label: mode === "all" ? "Показать весь граф" : "Вписать в экран",
      icon: IconArrowsMaximize,
      action: () =>
        flow.instance?.fitView({ padding: 0.12, maxZoom: 1, duration: 250 }),
    },
    {
      label: "Увеличить масштаб",
      icon: IconPlus,
      action: () => flow.instance?.zoomIn({ duration: 150 }),
    },
    {
      label: "Уменьшить масштаб",
      icon: IconMinus,
      action: () => flow.instance?.zoomOut({ duration: 150 }),
    },
  ];

  return (
    <section className={classes.widget} aria-label="Граф ингредиентов и блюд">
      <div className={classes.body}>
        <GraphSidebar
          graph={graph}
          mode={mode}
          selectedDish={selectedDish}
          onModeChange={setMode}
          onSelectDish={selectDish}
          disabled={isLoading || isError}
        />
        <div className={classes.mapArea}>
          <div className={classes.mapHeader}>
            <Text size="sm" fw={600}>
              {mode === "all"
                ? "Вся карта зависимостей"
                : (selectedDish?.data.name ?? "Разбор блюда")}
            </Text>
            <Text size="xs" c="dimmed">
              {mode === "all"
                ? `Узлов: ${graph.nodes.length} · связей: ${graph.edges.length}`
                : selectedDish
                  ? `Ингредиентов: ${visibleGraph.edges.length} шт`
                  : "Выберите блюдо в боковой панели"}
            </Text>
          </div>
          <div className={classes.canvas}>
            <ReactFlow<FlowNode, Edge>
              nodes={flow.nodes}
              edges={flow.edges}
              onNodesChange={flow.onNodesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={flow.setInstance}
              onMove={(_, viewport) => flow.setZoom(viewport.zoom)}
              onNodeMouseEnter={(_, node) => flow.setHovered(node.id)}
              onNodeMouseLeave={() => flow.setHovered(null)}
              onNodeClick={(_, node) => {
                if (node.type === "dish") selectDish(node.id);
              }}
              nodesDraggable
              nodesConnectable={false}
              nodesFocusable={false}
              edgesReconnectable={false}
              edgesFocusable={false}
              elementsSelectable={false}
              deleteKeyCode={null}
              selectionKeyCode={null}
              selectionOnDrag={false}
              connectOnClick={false}
              zoomOnDoubleClick={false}
              fitView
              fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
              minZoom={0.1}
              maxZoom={2}
              colorMode={colorMode}
              aria-label="Карта связей ингредиентов с блюдами"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color={colorMode === "dark" ? "#36505a" : "#e2e9e6"}
              />
            </ReactFlow>
            {mode === "all" && (
              <div className={classes.search}>
                <TextInput
                  size="md"
                  placeholder="Найти блюдо или ингредиент"
                  aria-label="Поиск по карте зависимостей"
                  leftSection={<IconSearch size={18} />}
                  value={flow.search}
                  onChange={(event) =>
                    flow.setSearch(event.currentTarget.value)
                  }
                  rightSection={
                    flow.search ? (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label="Очистить поиск"
                        onClick={() => flow.setSearch("")}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    ) : undefined
                  }
                />
              </div>
            )}
            <Group className={classes.controls} gap={6} wrap="nowrap">
              {controls.map((control) => (
                <Tooltip key={control.label} label={control.label}>
                  <ActionIcon
                    size="lg"
                    variant="default"
                    aria-label={control.label}
                    onClick={control.action}
                    loading={control.label === "Обновить граф" && isFetching}
                  >
                    <control.icon size={20} stroke={1.7} />
                  </ActionIcon>
                </Tooltip>
              ))}
              <span className={classes.zoom}>
                {Math.round(flow.zoom * 100)}%
              </span>
            </Group>
            {!isLoading && !isError && flow.query && !flow.matches.size && (
              <div className={classes.empty} role="status">
                <IconSearch size={28} />
                <Text fw={600}>Ничего не найдено</Text>
                <Text size="sm" c="dimmed">
                  Попробуйте другое название
                </Text>
              </div>
            )}
            {isLoading && (
              <div className={classes.empty} role="status" aria-live="polite">
                <Loader size="md" />
                <Text fw={600}>Загружаем граф зависимостей…</Text>
              </div>
            )}
            {isError && (
              <div className={classes.empty} role="alert">
                <Text fw={600}>Не удалось загрузить граф</Text>
                <Text size="sm" c="dimmed">
                  {apiErrorMessage(
                    error,
                    "Проверьте подключение и повторите попытку.",
                  )}
                </Text>
                <Button onClick={() => refetch()} loading={isFetching}>
                  Повторить
                </Button>
              </div>
            )}
            {!isLoading && !isError && !graph.nodes.length && !flow.query && (
              <div className={classes.empty} role="status">
                <IconTopologyStar3 size={32} />
                <Text fw={600}>Пока нет связей</Text>
                <Text size="sm" c="dimmed">
                  Карта появится, когда будут добавлены составы блюд
                </Text>
              </div>
            )}
            {!isLoading &&
              !isError &&
              graph.nodes.length > 0 &&
              mode === "dish" &&
              !selectedDish && (
                <div className={classes.empty} role="status">
                  <IconTopologyStar3 size={32} />
                  <Text fw={600}>Выберите блюдо</Text>
                  <Text size="sm" c="dimmed">
                    Откройте блюдо в списке слева или переключитесь на всю
                    карту.
                  </Text>
                </div>
              )}
          </div>
        </div>
      </div>
      <div className={classes.footer}>
        <Group gap="lg" className={classes.legend} aria-label="Цвета связей">
          {legendStatuses.map((key) => (
            <span key={key} className={classes.legendItem}>
              <i style={{ background: statusPresentation[key].color }} />
              {statusPresentation[key].label}
            </span>
          ))}
        </Group>
      </div>
    </section>
  );
}
