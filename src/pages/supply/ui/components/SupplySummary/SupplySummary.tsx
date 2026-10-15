import componentClasses from "./SupplySummary.module.css";
import { Alert, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconCoins, IconPackage } from "@tabler/icons-react";
import { formatMoney } from "@/entities/supply";

export function SupplySummary({
  count,
  saving,
  total,
  error,
  onClearError,
  submitLabel = "Создать поставку",
}: {
  count: number;
  saving?: boolean;
  total: number;
  error: string | null;
  onClearError: () => void;
  submitLabel?: string;
}) {
  return (
    <Paper withBorder p="lg" className={componentClasses.summary}>
      <Stack gap="md" h="100%" justify="space-between">
        <Stack gap="sm">
          <Title order={3} size="h4">
            Итоги поставки
          </Title>
          <Stack gap={4}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" c="dimmed">
                <IconPackage size={20} />
                <Text size="lg" fw={600}>
                  Количество позиций
                </Text>
              </Group>
              <Text size="lg" fw={700}>
                {count} шт.
              </Text>
            </Group>
          </Stack>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" c="dimmed">
              <IconCoins size={20} />
              <Text size="lg" fw={600}>
                Итого к оплате
              </Text>
            </Group>
            <Text
              size="lg"
              fw={700}
              c="primary"
              style={{ whiteSpace: "nowrap" }}
            >
              {formatMoney(total)}
            </Text>
          </Group>
        </Stack>
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
          loading={saving}
          size="lg"
          mt={6}
          fullWidth
          leftSection={<IconCheck size={20} />}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
