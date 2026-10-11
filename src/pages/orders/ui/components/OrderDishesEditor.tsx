import {
  ActionIcon,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  Title,
} from "@mantine/core";
import { IconChefHat, IconTrash } from "@tabler/icons-react";
import type { Dish } from "@/pages/dishes/model/type";
import type { OrderItemDraft } from "../../model/type";
import { orderTotal } from "../../model/calculations";
import { formatOrderMoney } from "../../model/format";
import { OrderDishSearch } from "./OrderDishSearch";
import classes from "../Orders.module.css";

export function OrderDishesEditor({
  dishes,
  items,
  submitted,
  onSelect,
  onQuantityChange,
  onRemove,
}: {
  dishes: Dish[];
  items: OrderItemDraft[];
  submitted: boolean;
  onSelect: (dish: Dish) => void;
  onQuantityChange: (id: string, quantity: number | string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={classes.dishSection}>
      <Title order={3} size="h4" className={classes.fixed}>
        Блюда в заказе
      </Title>
      <div className={classes.fixed}>
        <OrderDishSearch dishes={dishes} onSelect={onSelect} />
      </div>
      {items.length ? (
        <ScrollArea
          type="auto"
          offsetScrollbars
          className={classes.dishScroll}
          classNames={{ viewport: classes.dishViewport }}
        >
          <div className={classes.dishList}>
            <div className={classes.dishColumns} aria-hidden="true">
              {["Блюдо", "Количество", "Цена за ед.", "Сумма", ""].map(
                (label, index) => (
                  <Text key={index} size="lg" fw={600} c="dimmed">
                    {label}
                  </Text>
                ),
              )}
            </div>
            <Stack gap="xs">
              {items.map((item) => (
                <div key={item.dishId} className={classes.dishRow}>
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon variant="light" size={42} radius="md">
                      <IconChefHat size={23} />
                    </ThemeIcon>
                    <Text size="lg" fw={600}>
                      {item.name}
                    </Text>
                  </Group>
                  <NumberInput
                    size="lg"
                    label="Количество"
                    classNames={{ label: classes.quantityLabel }}
                    aria-label={`Количество ${item.name}`}
                    value={item.quantity}
                    min={1}
                    allowDecimal={false}
                    allowNegative={false}
                    error={
                      submitted &&
                      (!Number.isInteger(Number(item.quantity)) ||
                        Number(item.quantity) < 1)
                        ? "Укажите количество от 1"
                        : undefined
                    }
                    styles={{ input: { fontWeight: 700 } }}
                    onChange={(quantity) =>
                      onQuantityChange(item.dishId, quantity)
                    }
                  />
                  <Text size="lg" fw={600} style={{ whiteSpace: "nowrap" }}>
                    {formatOrderMoney(item.price)}
                    <Text
                      component="span"
                      size="sm"
                      c="dimmed"
                      className={classes.quantityLabel}
                    >
                      {" "}
                      за единицу
                    </Text>
                  </Text>
                  <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
                    {formatOrderMoney(orderTotal([item]))}
                    <Text
                      component="span"
                      size="sm"
                      c="dimmed"
                      className={classes.quantityLabel}
                    >
                      {" "}
                      сумма
                    </Text>
                  </Text>
                  <Tooltip label="Удалить блюдо">
                    <ActionIcon
                      size="lg"
                      variant="light"
                      color="red"
                      aria-label={`Удалить ${item.name}`}
                      onClick={() => onRemove(item.dishId)}
                    >
                      <IconTrash size={20} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              ))}
            </Stack>
          </div>
        </ScrollArea>
      ) : (
        <Stack
          className={classes.empty}
          align="center"
          justify="center"
          gap="xs"
        >
          <ThemeIcon variant="light" color="gray" size={64} radius="xl">
            <IconChefHat size={30} />
          </ThemeIcon>
          <Text size="lg" fw={600}>
            Добавьте первое блюдо
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Выберите блюдо в поиске выше и укажите количество.
          </Text>
        </Stack>
      )}
    </div>
  );
}
