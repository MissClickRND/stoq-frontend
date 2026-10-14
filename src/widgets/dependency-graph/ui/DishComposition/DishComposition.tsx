import { Text, Title } from "@mantine/core";
import type { DependencyGraph } from "@/entities/dependency-graph";
import { getDishIngredients, type ExplorerDish } from "../../model/explorer";
import { statusPresentation } from "../../model/config";
import classes from "./DishComposition.module.css";

const numberFormat = new Intl.NumberFormat("ru-RU");

export function DishComposition({ graph, dish }: { graph: DependencyGraph; dish: ExplorerDish }) {
  const ingredients = getDishIngredients(graph, dish.id);
  const status = statusPresentation[dish.data.status];

  return (
    <section className={classes.composition} aria-label={`Состав блюда ${dish.data.name}`}>
      <div className={classes.header}>
        <Text size="xs" c="dimmed">Состав выбранного блюда</Text>
        <Title order={3} className={classes.title}>{dish.data.name}</Title>
        <Text size="xs" className={classes.status} style={{ color: status.color }}>{status.dishLabel}</Text>
      </div>
      <div className={classes.rows} tabIndex={0} role="region" aria-label={`Ингредиенты блюда ${dish.data.name}`}>
        {ingredients.length ? <table className={classes.table}>
          <thead><tr><th>Ингредиент</th><th>Нужно</th><th>Есть</th></tr></thead>
          <tbody>
            {ingredients.map(({ ingredient, edge }) => {
              const presentation = statusPresentation[edge.data.status];
              return <tr key={edge.id}>
                <td>
                  <Text size="xs" fw={500}>{ingredient.data.name}</Text>
                  <Text className={classes.rowStatus} style={{ color: presentation.color }}>{presentation.label}</Text>
                </td>
                <td>{numberFormat.format(edge.data.required)} {edge.data.unit}</td>
                <td>{numberFormat.format(ingredient.data.quantity)} {ingredient.data.unit}</td>
              </tr>;
            })}
          </tbody>
        </table> : <Text size="sm" c="dimmed">Состав пока не указан</Text>}
      </div>
    </section>
  );
}
