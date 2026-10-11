import { ActionIcon, Group, Paper, Text, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { formatOrderMoney } from "@/pages/orders/model/format";
import { orderTotal } from "@/pages/orders/model/calculations";
import { useGuestOrder } from "../../model/GuestOrderProvider";
import { GuestDishPhoto } from "./GuestDishPhoto";
import classes from "../Guest.module.css";

export function GuestCartItems() {
  const { items, setQuantity, removeDish } = useGuestOrder();
  return (
    <Paper withBorder p="lg">
      {items.map((item) => (
        <div className={classes.cartRow} key={item.dishId}>
          <GuestDishPhoto
            src={item.imageUrl}
            name={item.name}
            className={classes.cartPhoto}
          />
          <div className={classes.cartName}>
            <Text size="lg" fw={700}>
              {item.name}
            </Text>
            <Text size="sm" c="dimmed">
              {formatOrderMoney(item.price)} за порцию
            </Text>
          </div>
          <Text
            size="lg"
            fw={700}
            className={classes.cartPrice}
            style={{ whiteSpace: "nowrap" }}
          >
            {formatOrderMoney(orderTotal([item]))}
          </Text>
          <Group gap="xs" wrap="nowrap" className={classes.cartQuantity}>
            <ActionIcon
              size="lg"
              variant="default"
              disabled={Number(item.quantity) <= 1}
              aria-label={`Уменьшить количество ${item.name}`}
              onClick={() =>
                setQuantity(item.dishId, Number(item.quantity) - 1)
              }
            >
              <IconMinus size={20} />
            </ActionIcon>
            <Text
              size="lg"
              fw={700}
              miw={22}
              ta="center"
              aria-label={`Количество ${item.name}`}
            >
              {item.quantity}
            </Text>
            <ActionIcon
              size="lg"
              variant="default"
              aria-label={`Увеличить количество ${item.name}`}
              onClick={() =>
                setQuantity(item.dishId, Number(item.quantity) + 1)
              }
            >
              <IconPlus size={20} />
            </ActionIcon>
          </Group>
          <Tooltip label="Удалить из корзины">
            <ActionIcon
              className={classes.cartRemove}
              size="lg"
              variant="light"
              color="red"
              aria-label={`Удалить из корзины ${item.name}`}
              onClick={() => removeDish(item.dishId)}
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Tooltip>
        </div>
      ))}
    </Paper>
  );
}
