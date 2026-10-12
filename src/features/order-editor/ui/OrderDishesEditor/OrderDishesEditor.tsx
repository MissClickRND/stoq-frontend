import componentClasses from "./OrderDishesEditor.module.css";
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
import type { ReactNode } from "react";
import {
  type OrderItemDraft,
  orderTotal,
  formatOrderMoney,
} from "@/entities/order";

export function OrderDishesEditor({
  search,
  items,
  submitted,
  onQuantityChange,
  onRemove,
}: {
  search: ReactNode;
  items: OrderItemDraft[];
  submitted: boolean;
  onQuantityChange: (id: string, quantity: number | string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={componentClasses.dishSection}>
      <Title order={3} size="h4" className={componentClasses.fixed}>
        Блюда в заказе
      </Title>
      <div className={componentClasses.fixed}>
        {search}
      </div>
      {items.length ? (
        <ScrollArea
          type="auto"
          offsetScrollbars
          className={componentClasses.dishScroll}
          classNames={{ viewport: componentClasses.dishViewport }}
        >
          <div className={componentClasses.dishList}>
            <div className={componentClasses.dishColumns} aria-hidden="true">
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
                <div key={item.dishId} className={componentClasses.dishRow}>
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
                    classNames={{ label: componentClasses.quantityLabel }}
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
                      className={componentClasses.quantityLabel}
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
                      className={componentClasses.quantityLabel}
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
          className={componentClasses.empty}
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
