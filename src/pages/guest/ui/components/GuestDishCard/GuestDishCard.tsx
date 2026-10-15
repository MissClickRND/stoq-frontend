import componentClasses from "./GuestDishCard.module.css";
import { Badge, Button, Group, Paper, Text } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { type Dish, dishCanBeOrdered, DishPhoto } from "@/entities/dish";

import { formatOrderMoney } from "@/entities/order";
import { useGuestOrder } from "@/features/guest-order";

export function GuestDishCard({
  dish,
  recommended = false,
}: {
  dish: Dish;
  recommended?: boolean;
}) {
  const { basePath, items, addDish } = useGuestOrder();
  const unavailable = !dishCanBeOrdered(dish);
  const quantity = items.find((item) => item.dishId === dish.id)?.quantity;
  return (
    <Paper
      radius="lg"
      className={componentClasses.card}
      component="article"
      aria-label={dish.name}
    >
      <Link
        to={`${basePath}/dish/${encodeURIComponent(dish.id)}`}
        aria-label={`Подробнее о ${dish.name}`}
      >
        <DishPhoto src={dish.imageUrl} name={dish.name} />
      </Link>
      <div className={componentClasses.cardBody}>
        {recommended && (
          <Badge variant="light" color="primary" tt="none">
            Советуем
          </Badge>
        )}
        <Text size="lg" fw={700} className={componentClasses.cardName}>
          {dish.name}
        </Text>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {dish.description}
        </Text>
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            {formatOrderMoney(dish.price)}
          </Text>
          {unavailable ? (
            <Badge variant="light" color="gray" tt="none">
              Недоступно
            </Badge>
          ) : quantity ? (
            <Badge variant="light" tt="none">
              В корзине: {quantity}
            </Badge>
          ) : null}
        </Group>
        <div className={componentClasses.cardActions}>
          <Button
            component={Link}
            to={`${basePath}/dish/${encodeURIComponent(dish.id)}`}
            variant="default"
            size="md"
            px="sm"
          >
            Подробнее
          </Button>
          <Button
            size="md"
            px="sm"
            disabled={unavailable}
            leftSection={<IconShoppingCart size={18} />}
            onClick={() => addDish(dish)}
          >
            {quantity ? "Добавить ещё" : "В корзину"}
          </Button>
        </div>
      </div>
    </Paper>
  );
}
