import { useState, type FormEvent } from "react";
import { Alert, Button, FileInput, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { apiErrorMessage } from "@/shared/lib/api-error";

type Props = {
  opened: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
};

function ScanUpdForm({ loading, onClose, onSubmit }: Omit<Props, "opened">) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (!file) return setError("Выберите фото УПД.");
    if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) {
      return setError("Выберите файл PNG, JPEG, WEBP или PDF.");
    }
    if (file.size === 0 || file.size > 20 * 1024 * 1024) {
      return setError("Файл должен быть непустым и не больше 20 МБ.");
    }
    try {
      await onSubmit(file);
    } catch (error) {
      setError(apiErrorMessage(error, "Не удалось распознать УПД. Повторите попытку."));
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Загрузите чёткое фото с наименованиями товаров, количеством и суммами.
        </Text>
        <FileInput
          label="Фото или файл УПД"
          placeholder="Выберите файл"
          description="PNG, JPEG, WEBP или PDF, до 20 МБ"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          leftSection={<IconUpload size={20} />}
          value={file}
          onChange={(value) => { setFile(value); setError(null); }}
          disabled={loading}
          clearable
          required
          size="lg"
          data-autofocus
        />
        {error && <Alert color="red" role="alert">{error}</Alert>}
        {loading && (
          <Stack align="center" gap="xs" py="md" role="status" aria-live="polite">
            <Loader size="md" />
            <Text fw={500}>Распознаём УПД и подготавливаем товары…</Text>
            <Text size="sm" c="dimmed">Обычно это занимает до 1 минуты</Text>
          </Stack>
        )}
        <Group justify="flex-end">
          <Button type="button" variant="default" disabled={loading} onClick={onClose}>Отмена</Button>
          <Button type="submit" loading={loading} disabled={!file}>Отправить</Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ScanUpdModal(props: Props) {
  return (
    <Modal
      opened={props.opened}
      onClose={() => { if (!props.loading) props.onClose(); }}
      title="Отсканировать УПД"
      centered
      size="md"
      closeOnClickOutside={!props.loading}
      closeOnEscape={!props.loading}
      withCloseButton={!props.loading}
    >
      {props.opened && <ScanUpdForm {...props} />}
    </Modal>
  );
}
