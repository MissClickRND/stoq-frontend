import componentClasses from "./GuestRoutesLayout.module.css";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { Outlet, useParams } from "react-router-dom";
import { useGuestRestaurant } from "@/entities/restaurant";
import { GuestOrderProvider } from "@/features/guest-order";
import { GuestHeader } from "../GuestHeader/GuestHeader";

export function GuestRoutesLayout() {
  const { restaurantId } = useParams();
  const { restaurant } = useGuestRestaurant(restaurantId);
  if (!restaurant)
    return (
      <div className={componentClasses.shell}>
        <main className={componentClasses.content}>
          <Paper withBorder p="xl" mt="xl">
            <Stack>
              <Title order={1}>Ресторан не найден</Title>
              <Text c="dimmed">
                Проверьте ссылку на гостевое меню или попросите новый QR-код у
                сотрудника ресторана.
              </Text>
            </Stack>
          </Paper>
        </main>
      </div>
    );
  return (
    <GuestOrderProvider key={restaurant.id} restaurant={restaurant}>
      <div className={componentClasses.shell}>
        <GuestHeader />
        <main className={componentClasses.content}>
          <Outlet />
        </main>
        <footer className={componentClasses.footer}>
          <Text size="sm" c="dimmed" ta="center">
            STOQ · Меню для гостей {restaurant.name}
          </Text>
        </footer>
      </div>
    </GuestOrderProvider>
  );
}
