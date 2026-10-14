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
import { useDependencyGraph } from "@/entities/dependency-graph";
import { useDependencyFlow } from "../../model/useDependencyFlow";
import { statusPresentation } from "../../model/config";
import type { FlowNode } from "../../model/type";
import { GraphNode } from "../GraphNode/GraphNode";
import { RecipeConnection } from "../RecipeConnection/RecipeConnection";
import classes from "./DependencyGraph.module.css";
import { apiErrorMessage } from "@/shared/lib/api-error";

const nodeTypes = { ingredient: GraphNode, dish: GraphNode };
const edgeTypes = { recipe: RecipeConnection };
const legendStatuses = ["available", "low_stock", "unavailable"] as const;

export function DependencyGraph() {
  const { graph, isLoading, isFetching, isError, error, refetch } =
    useDependencyGraph();
  const colorMode = useComputedColorScheme("light");
  const flow = useDependencyFlow(graph, colorMode);
  const controls = [
    {
      label: "Обновить граф",
      icon: IconRefresh,
      action: () => {
        void refetch();
      },
    },
    {
      label: "Показать весь граф",
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
        <div className={classes.search}>
          <TextInput
            size="md"
            placeholder="Найти блюдо или ингредиент"
            aria-label="Поиск по карте зависимостей"
            leftSection={<IconSearch size={18} />}
            value={flow.search}
            onChange={(event) => flow.setSearch(event.currentTarget.value)}
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
          <span className={classes.zoom}>{Math.round(flow.zoom * 100)}%</span>
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
