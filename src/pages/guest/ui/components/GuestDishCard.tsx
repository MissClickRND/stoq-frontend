import { Badge, Button, Group, Paper, Text } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { Dish } from "@/pages/dishes/model/type";
import { dishIsStopped } from "@/pages/dishes/model/calculations";
import { formatOrderMoney } from "@/pages/orders/model/format";
import { useGuestOrder } from "../../model/GuestOrderProvider";
import { GuestDishPhoto } from "./GuestDishPhoto";
import classes from "../Guest.module.css";

export function GuestDishCard({ dish }: { dish: Dish }) {
  const { basePath, items, addDish } = useGuestOrder();
  const unavailable = dishIsStopped(dish);
  const quantity = items.find((item) => item.dishId === dish.id)?.quantity;
  return (
    <Paper
      radius="lg"
      className={classes.card}
      component="article"
      aria-label={dish.name}
    >
      <Link
        to={`${basePath}/dish/${encodeURIComponent(dish.id)}`}
        aria-label={`Подробнее о ${dish.name}`}
      >
        <GuestDishPhoto src={dish.imageUrl} name={dish.name} />
      </Link>
      <div className={classes.cardBody}>
        <Text size="lg" fw={700} className={classes.cardName}>
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
        <div className={classes.cardActions}>
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
