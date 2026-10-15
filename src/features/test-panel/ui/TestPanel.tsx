import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Text,
  Alert,
  Stack,
  Title,
} from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { apiErrorMessage } from "@/shared/lib/api-error";
import {
  usePrepareTestDataMutation,
  useResetTestDataMutation,
} from "../api/testPanel";

export default function TestPanel() {
  const navigate = useNavigate();
  const [resetOpened, setResetOpened] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [prepare, { isLoading: preparing }] = usePrepareTestDataMutation();
  const [reset, { isLoading: resetting }] = useResetTestDataMutation();
  const busy = preparing || resetting;
  const run = async (mode: "seed" | "external" | "short-life") => {
    if (busy) return;
    setFailure("");
    setMessage("");
    try {
      setMessage((await prepare(mode).unwrap()).message);
    } catch (error) {
      setFailure(
        apiErrorMessage(
          error,
          "Операция не завершена. Уже выполненные шаги сохранены; проверьте данные перед повтором.",
        ),
      );
    }
  };
  return (
    <Center w="100%" mih="100dvh" p="md">
      <Paper w="100%" maw={720} p="lg" shadow="sm" withBorder>
        <Group justify="space-between">
          <Text fz={24} fw={700}>
            Панель тестирования
          </Text>
          <ActionIcon
            size="lg"
            aria-label="На главную"
            onClick={() => navigate("/")}
          >
            <IconHome />
          </ActionIcon>
        </Group>

        <Divider my="sm" />
        <Stack gap="lg">
          <Text c="dimmed">
            Связанные тестовые продукты, рецепты блюд и складские партии
            создаются через обычные API приложения.
          </Text>
          {message && (
            <Alert color="green" role="status">
              {message}
            </Alert>
          )}
          {failure && (
            <Alert color="red" role="alert">
              {failure}
            </Alert>
          )}
          <Stack gap="sm">
            <Title order={2} size="lg">
              Заполнить базу
            </Title>
            <Text size="sm" c="dimmed">
              6 продуктов, 3 блюда с фотографиями и рецептами, 8 складских
              партий со сроками от 2 минут до года. При повторном заполнении
              продукты и блюда с такими названиями используются повторно, на
              склад добавляются новые партии.
            </Text>
            <Button
              loading={preparing}
              disabled={busy}
              onClick={() => run("seed")}
            >
              Заполнить БД
            </Button>
          </Stack>
          <Stack gap="sm">
            <Title order={2} size="lg">
              Поставка из внешнего источника
            </Title>
            <Text size="sm" c="dimmed">
              Демо-импорт трёх позиций каталога от внешнего поставщика. Статус
              «В пути», остатки появятся после приёмки.
            </Text>
            <Button
              variant="light"
              disabled={busy}
              onClick={() => run("external")}
            >
              Оформить внешнюю поставку
            </Button>
          </Stack>
          <Stack gap="sm">
            <Title order={2} size="lg">
              Поставка с коротким сроком годности
            </Title>
            <Text size="sm" c="dimmed">
              До двух позиций из каталога со сроком годности через 1 и 2 минуты.
              Поставка сразу принимается на склад. Сначала заполните каталог
              продуктов.
            </Text>
            <Button
              color="orange"
              variant="light"
              disabled={busy}
              onClick={() => run("short-life")}
            >
              Добавить поставку с маленьким сроком жизни
            </Button>
          </Stack>
          <Alert color="orange" title="Сброс рабочих данных">
            Удаляются блюда, рецепты, продукты, заказы, поставки и остатки.
            Пользователи, заведение и единицы измерения сохраняются.
            <Button
              color="red"
              variant="light"
              mt="md"
              disabled={busy}
              onClick={() => setResetOpened(true)}
            >
              Очистить БД
            </Button>
          </Alert>
          <Button component={Link} to="/supply" variant="default">
            Перейти к поставкам
          </Button>
        </Stack>
        <ConfirmationModal
          opened={resetOpened}
          title="Очистить рабочие данные?"
          message="Все блюда, продукты, заказы, поставки и складские записи будут удалены."
          warning="Это действие нельзя отменить."
          confirmText="Очистить БД"
          cancelText="Отмена"
          loading={resetting}
          onClose={() => {
            if (!busy) setResetOpened(false);
          }}
          onConfirm={async () => {
            if (busy) return;
            setFailure("");
            setMessage("");
            try {
              await reset().unwrap();
              setResetOpened(false);
              setMessage("Рабочие данные очищены");
            } catch (error) {
              setFailure(
                apiErrorMessage(error, "Не удалось завершить сброс данных"),
              );
              setResetOpened(false);
            }
          }}
        />
      </Paper>
    </Center>
  );
}
