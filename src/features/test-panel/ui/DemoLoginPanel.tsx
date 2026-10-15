import {
  Accordion,
  Alert,
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { roleHome, roleLabels } from "@/entities/user";
import { useAppDispatch } from "@/shared/lib";
import { sessionStarted } from "@/shared/lib/session-events";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { testPanelApi, type DemoAccount } from "../api/testPanel";
import classes from "@/shared/ui/auth-fields/classes/AuthFields.module.css";

export function DemoLoginPanel() {
  const restaurants = testPanelApi.useDemoRestaurantsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [login, mutation] = testPanelApi.useDemoLoginMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const restaurant =
    restaurants.data?.find((item) => String(item.id) === selected) ??
    restaurants.data?.[0];
  const errorStatus =
    restaurants.error && "status" in restaurants.error
      ? restaurants.error.status
      : undefined;
  if (errorStatus === 403 || errorStatus === 404) return null;
  const enter = async (role: DemoAccount["role"]) => {
    if (!restaurant || mutation.isLoading) return;
    try {
      const result = await login({
        restaurantId: restaurant.id,
        role,
      }).unwrap();
      dispatch(sessionStarted(result.user));
      navigate(roleHome(result.user.role), { replace: true });
    } catch {
      /* Keep test roles available and show the server error below. */
    }
  };
  return (
    <Accordion mt="lg" variant="separated">
      <Accordion.Item value="demo">
        <Accordion.Control>Тестовый вход</Accordion.Control>
        <Accordion.Panel>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Отдельный ресторан с тестовыми данными и аккаунтом для каждой
              роли.
            </Text>
            {restaurants.isLoading ? (
              <Loader size="sm" />
            ) : restaurants.isError ? (
              <Alert color="red" role="alert">
                {apiErrorMessage(
                  restaurants.error,
                  "Не удалось загрузить тестовые рестораны.",
                )}
                <Button variant="subtle" onClick={() => restaurants.refetch()}>
                  Повторить
                </Button>
              </Alert>
            ) : restaurant ? (
              <>
                <Select
                  label="Тестовый ресторан"
                  data={(restaurants.data ?? []).map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                  value={String(restaurant.id)}
                  allowDeselect={false}
                  onChange={setSelected}
                  disabled={mutation.isLoading}
                  classNames={{
                    input: classes.input,
                    section: classes.section,
                  }}
                  styles={{
                    dropdown: {
                      backgroundColor: "white",
                      color: "var(--mantine-color-secondary-9)",
                    },
                  }}
                />
                <Group grow>
                  {restaurant.accounts.map((account) => (
                    <Button
                      key={account.id}
                      variant="light"
                      loading={
                        mutation.isLoading &&
                        mutation.originalArgs?.role === account.role
                      }
                      disabled={mutation.isLoading}
                      onClick={() => enter(account.role)}
                    >
                      {roleLabels[account.role]}
                    </Button>
                  ))}
                </Group>
                <Button
                  component={Link}
                  to={`/order/new/guest/${restaurant.id}`}
                  variant="default"
                >
                  Открыть как гость
                </Button>
              </>
            ) : (
              <Text size="sm">
                Тестовых ресторанов пока нет. Администратор может создать
                отдельный ресторан на странице /test.
              </Text>
            )}
            {mutation.error && (
              <Alert color="red" role="alert">
                {apiErrorMessage(
                  mutation.error,
                  "Не удалось выполнить тестовый вход.",
                )}
              </Alert>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
