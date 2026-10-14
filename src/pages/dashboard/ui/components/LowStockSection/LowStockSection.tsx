import { Badge, Group, Paper, Text, Title } from "@mantine/core";
import type { LowStockProduct } from "../../../model/type";
import { LowStockProductCard } from "../LowStockProductCard/LowStockProductCard";
import classes from "./LowStockSection.module.css";

export function LowStockSection({ products }: { products: LowStockProduct[] }) {
  return (
    <Paper
      component="section"
      withBorder
      className={classes.section}
      aria-labelledby="dashboard-stock-title"
    >
      <Group className={classes.header} justify="space-between" wrap="nowrap">
        <div>
          <Title order={2} id="dashboard-stock-title" className={classes.title}>
            Скоро закончатся
          </Title>
          <Text size="sm" c="dimmed">
            Продукты с низким остатком
          </Text>
        </div>
        <Badge variant="light" color="orange">
          {products.length}
        </Badge>
      </Group>

      <div
        className={classes.scrollArea}
        role="region"
        aria-label="Список продуктов с низким остатком"
        tabIndex={0}
      >
        {products.length ? (
          <ul className={classes.list}>
            {products.map((item) => (
              <LowStockProductCard key={item.product.id} item={item} />
            ))}
          </ul>
        ) : (
          <Text size="sm" c="dimmed" className={classes.empty}>
            Продуктов с низким остатком нет
          </Text>
        )}
      </div>
    </Paper>
  );
}
