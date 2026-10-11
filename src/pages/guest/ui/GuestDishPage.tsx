import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { PageBreadcrumbs } from "@/shared/ui/page-breadcrumbs";
import { useDishes } from "@/pages/dishes/model/DishesProvider";
import { dishIsStopped } from "@/pages/dishes/model/calculations";
import { formatOrderMoney } from "@/pages/orders/model/format";
import { useGuestOrder } from "../model/GuestOrderProvider";
import { GuestDishPhoto } from "./components/GuestDishPhoto";
import classes from "./Guest.module.css";

export function GuestDishPage() {
  const { dishId } = useParams();
  const { dishes } = useDishes();
  const { basePath, items, addDish } = useGuestOrder();
  const dish = dishes.find((item) => item.id === dishId && !item.archived);
  if (!dish)
    return (
      <Stack>
        <PageBreadcrumbs
          parentLabel="Меню"
          parentPath={basePath}
          currentLabel="Блюдо не найдено"
        />
        <Paper withBorder p="xl">
          <Title order={1} className={classes.title}>
            Блюдо не найдено
          </Title>
        </Paper>
      </Stack>
    );
  const unavailable = dishIsStopped(dish);
  const quantity = items.find((item) => item.dishId === dish.id)?.quantity;
  return (
    <Stack gap="lg">
      <PageBreadcrumbs
        parentLabel="Меню"
        parentPath={basePath}
        currentLabel={dish.name}
      />
      <div className={classes.detailGrid}>
        <GuestDishPhoto
          src={dish.imageUrl}
          name={dish.name}
          className={classes.detailPhoto}
        />
        <Paper withBorder p="xl">
          <Stack gap="lg">
            <Title order={1} className={classes.title}>
              {dish.name}
            </Title>
            <Text size="lg" c="dimmed">
              {dish.description}
            </Text>
            <div>
              <Text size="lg" fw={600} mb="xs">
                Состав
              </Text>
              <Text>
                {dish.ingredients
                  .map((ingredient) => ingredient.name)
                  .join(", ") || "Состав уточняется"}
              </Text>
            </div>
            <Group justify="space-between">
              <Text size="xl" fw={700}>
                {formatOrderMoney(dish.price)}
              </Text>
              {quantity && (
                <Badge size="lg" variant="light" tt="none">
                  В корзине: {quantity}
                </Badge>
              )}
            </Group>
            {unavailable && (
              <Text c="dimmed">Блюдо временно недоступно для заказа.</Text>
            )}
            <Button
              size="lg"
              disabled={unavailable}
              leftSection={<IconShoppingCart size={20} />}
              onClick={() => addDish(dish)}
            >
              {quantity ? "Добавить ещё" : "Добавить в корзину"}
            </Button>
          </Stack>
        </Paper>
      </div>
    </Stack>
  );
}
