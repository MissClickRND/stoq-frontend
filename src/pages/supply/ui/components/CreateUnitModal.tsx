import { useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";

export function CreateUnitModal({
  opened,
  units,
  onClose,
  onCreate,
}: {
  opened: boolean;
  units: string[];
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Новая единица измерения"
      centered
      size="sm"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = name.trim().replace(/\s+/g, " ");
          if (!trimmed) return setError("Введите название");
          if (
            units.some(
              (unit) =>
                unit.toLocaleLowerCase("ru-RU") ===
                trimmed.toLocaleLowerCase("ru-RU"),
            )
          )
            return setError("Такая единица измерения уже существует");
          onCreate(trimmed);
          //! Сбросить форму и закрыть модальное окно после успешного создания на сервере.
        }}
      >
        <Stack>
          <TextInput
            label="Название"
            placeholder="Например, коробка"
            withAsterisk
            maxLength={30}
            data-autofocus
            value={name}
            error={error}
            onChange={(event) => {
              setName(event.currentTarget.value);
              setError(null);
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
