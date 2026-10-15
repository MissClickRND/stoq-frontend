import { Alert, Badge, Button, Center, Group, Loader, Paper, Text, Title } from "@mantine/core";
import type { LowStockProduct } from "../../../model/type";
import { LowStockProductCard } from "../LowStockProductCard/LowStockProductCard";
import classes from "./LowStockSection.module.css";

export function LowStockSection({ products, loading, error, onRetry }: { products: LowStockProduct[]; loading: boolean; error: boolean; onRetry: () => void }) {
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
            Общий остаток до 10 единиц, по данным склада
          </Text>
        </div>
        <Badge variant="light" color="orange">
          {loading || error ? "—" : products.length}
        </Badge>
      </Group>

      <div
        className={classes.scrollArea}
        role="region"
        aria-label="Список продуктов с низким остатком"
        tabIndex={0}
      >
        {error ? <Alert color="red" m="md" title="Не удалось загрузить остатки"><Button variant="subtle" onClick={onRetry}>Повторить</Button></Alert> : loading ? <Center p="xl"><Loader size="sm" aria-label="Загрузка остатков" /></Center> : products.length ? (
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
