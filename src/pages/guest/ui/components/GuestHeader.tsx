import { Anchor, Button, Group, Text } from "@mantine/core";
import { IconLeaf, IconShoppingCart } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useGuestOrder } from "../../model/GuestOrderProvider";
import classes from "../Guest.module.css";

export function GuestHeader() {
  const { restaurant, basePath, quantity } = useGuestOrder();
  return (
    <header className={classes.header}>
      <div className={classes.headerInner}>
        <Anchor
          component={Link}
          to={basePath}
          className={classes.brand}
          aria-label="STOQ — меню"
        >
          <Group gap={8} wrap="nowrap">
            <IconLeaf size={36} color="var(--mantine-color-primary-6)" />
            <Text className={classes.brandText}>STOQ</Text>
          </Group>
        </Anchor>
        <div className={classes.restaurant}>
          <Text size="lg" fw={700}>
            {restaurant.name}
          </Text>
          <Text size="sm" c="dimmed">
            {restaurant.city}
          </Text>
        </div>
        <Button
          component={Link}
          to={`${basePath}/cart`}
          size="lg"
          leftSection={<IconShoppingCart size={20} />}
          aria-label={`Корзина, блюд: ${quantity}`}
        >
          Корзина · {quantity}
        </Button>
      </div>
    </header>
  );
}
