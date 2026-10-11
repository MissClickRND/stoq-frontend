import componentClasses from "./GuestCartItems.module.css";
import { ActionIcon, Group, Paper, Text, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { formatOrderMoney, orderTotal } from "@/entities/order";

import { useGuestOrder } from "@/features/guest-order";
import { DishPhoto } from "@/entities/dish";

export function GuestCartItems() {
  const { items, setQuantity, removeDish } = useGuestOrder();
  return (
    <Paper withBorder p="lg">
      {items.map((item) => (
        <div className={componentClasses.cartRow} key={item.dishId}>
          <DishPhoto
            src={item.imageUrl}
            name={item.name}
            className={componentClasses.cartPhoto}
          />
          <div className={componentClasses.cartName}>
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
            className={componentClasses.cartPrice}
            style={{ whiteSpace: "nowrap" }}
          >
            {formatOrderMoney(orderTotal([item]))}
          </Text>
          <Group
            gap="xs"
            wrap="nowrap"
            className={componentClasses.cartQuantity}
          >
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
              className={componentClasses.cartRemove}
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
