import {
  Alert,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck, IconCoins, IconPackage } from "@tabler/icons-react";
import { formatMoney } from "../../model/format";
import classes from "./SupplyForm.module.css";

export function SupplySummary({
  count,
  total,
  error,
  onClearError,
}: {
  count: number;
  total: number;
  error: string | null;
  onClearError: () => void;
}) {
  return (
    <Paper withBorder p="lg" className={classes.summary}>
      <Stack gap="md">
        <Title order={3} size="h4">
          Итоги поставки
        </Title>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" c="dimmed">
            <IconPackage size={20} />
            <Text size="lg">Количество позиций</Text>
          </Group>
          <Text size="lg" fw={700}>
            {count}
          </Text>
        </Group>
        <Group justify="space-between" wrap="nowrap">
          <Text size="lg" c="dimmed">
            Сумма продуктов
          </Text>
          <Text size="lg" fw={700} style={{ whiteSpace: "nowrap" }}>
            {formatMoney(total)}
          </Text>
        </Group>
        <Divider />
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <IconCoins size={22} />
            <Text fw={600}>Итого к оплате</Text>
          </Group>
          <Text size="xl" fw={700} c="primary" style={{ whiteSpace: "nowrap" }}>
            {formatMoney(total)}
          </Text>
        </Group>
        {error && (
          <Alert
            color="red"
            role="alert"
            withCloseButton
            onClose={onClearError}
          >
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          size="lg"
          fullWidth
          leftSection={<IconCheck size={20} />}
        >
          Создать поставку
        </Button>
      </Stack>
    </Paper>
  );
}
