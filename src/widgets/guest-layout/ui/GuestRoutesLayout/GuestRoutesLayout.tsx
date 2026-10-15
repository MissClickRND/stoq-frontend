import componentClasses from "./GuestRoutesLayout.module.css";
import { Button, Center, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { Outlet, useParams } from "react-router-dom";

import { GuestOrderProvider } from "@/features/guest-order";
import { GuestHeader } from "../GuestHeader/GuestHeader";
import { useGuestRestaurant } from "@/entities/restaurant";

export function GuestRoutesLayout() {
  const { restaurantId } = useParams();
  const { restaurant, isLoading, isError, refetch } = useGuestRestaurant(restaurantId);
  if (isLoading)
    return <Center mih="100svh"><Loader aria-label="Загрузка ресторана" /></Center>;
  if (!restaurant)
    return (
      <div className={componentClasses.shell}>
        <main className={componentClasses.content}>
          <Paper withBorder p="xl" mt="xl">
            <Stack>
              <Title order={1}>{isError ? "Не удалось загрузить ресторан" : "Ресторан не найден"}</Title>
              <Text c="dimmed">
                Проверьте ссылку на гостевое меню или попросите новый QR-код у
                сотрудника ресторана.
              </Text>
              {isError && <Button onClick={() => refetch()}>Повторить</Button>}
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
