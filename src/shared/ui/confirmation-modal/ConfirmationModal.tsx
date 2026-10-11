import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";

type ConfirmationModalProps = {
  opened: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
};

export function ConfirmationModal({
  opened,
  title,
  message,
  warning,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
  loading,
}: ConfirmationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack gap="lg">
        <Text>{message}</Text>
        {warning && <Alert color="orange">{warning}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
