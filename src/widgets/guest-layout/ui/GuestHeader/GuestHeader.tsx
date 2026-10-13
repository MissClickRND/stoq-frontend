import componentClasses from "./GuestHeader.module.css";
import { Anchor, Button, Text, Image } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useGuestOrder } from "@/features/guest-order";
import { appLogo } from "@/shared/config/brand";

export function GuestHeader() {
  const { restaurant, basePath, quantity } = useGuestOrder();
  return (
    <header className={componentClasses.header}>
      <div className={componentClasses.headerInner}>
        <Anchor
          component={Link}
          to={basePath}
          className={componentClasses.brand}
          aria-label="STOQ — меню"
        >
          <Image className={componentClasses.logo} src={appLogo.src} alt={appLogo.alt} />
        </Anchor>
        <div className={componentClasses.restaurant}>
          <Text size="lg" fw={700}>
            {restaurant.name}
          </Text>
          <Text size="sm" c="dimmed">
            {restaurant.city}
          </Text>
        </div>
        <Button
          className={componentClasses.cart}
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
