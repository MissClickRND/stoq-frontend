import { Paper, Stack, Text, Title } from "@mantine/core";
import { Outlet, useParams } from "react-router-dom";
import { getMockRestaurants } from "@/shared/api/auth-mock";
import { GuestOrderProvider } from "../model/GuestOrderProvider";
import { GuestHeader } from "./components/GuestHeader";
import classes from "./Guest.module.css";

export function GuestRoutesLayout() {
  const { restaurantId } = useParams();
  const restaurant = getMockRestaurants().find(
    (item) => item.id === restaurantId,
  );
  if (!restaurant)
    return (
      <div className={classes.shell}>
        <main className={classes.content}>
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
      <div className={classes.shell}>
        <GuestHeader />
        <main className={classes.content}>
          <Outlet />
        </main>
        <footer className={classes.footer}>
          <Text size="sm" c="dimmed" ta="center">
            STOQ · Меню для гостей {restaurant.name}
          </Text>
        </footer>
      </div>
    </GuestOrderProvider>
  );
}
