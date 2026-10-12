import { Alert, Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCreateUnitMutation, type IUnit } from "@/entities/unit";
import { apiErrorMessage } from "@/shared/lib/api-error";

export function CreateUnitModal({
  opened,
  units,
  onClose,
  onCreated,
}: {
  opened: boolean;
  units: IUnit[];
  onClose: () => void;
  onCreated: (unit: IUnit) => void;
}) {
  const [createUnit, { isLoading, error }] = useCreateUnitMutation();
  const form = useForm({
    initialValues: { name: "", shortName: "" },
    validateInputOnBlur: true,
    validate: {
      name: (value) =>
        !value.trim()
          ? "Введите название"
          : value.trim().length > 100
            ? "Не более 100 символов"
            : units.some(
                  (unit) =>
                    unit.name.toLocaleLowerCase("ru-RU") ===
                    value.trim().toLocaleLowerCase("ru-RU"),
                )
              ? "Такая единица уже существует"
              : null,
      shortName: (value) =>
        !value.trim()
          ? "Введите сокращение"
          : value.trim().length > 10
            ? "Не более 10 символов"
            : units.some(
                  (unit) =>
                    unit.shortName.toLocaleLowerCase("ru-RU") ===
                    value.trim().toLocaleLowerCase("ru-RU"),
                )
              ? "Такое сокращение уже существует"
              : null,
    },
  });
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Новая единица измерения"
      centered
      size="md"
    >
      <form
        noValidate
        onSubmit={form.onSubmit(async (values) => {
          try {
            const unit = await createUnit({
              name: values.name.trim(),
              shortName: values.shortName.trim(),
            }).unwrap();
            onCreated(unit);
          } catch {
            // Preserve the draft and display the server error.
          }
        })}
      >
        <Stack gap="md">
          {error && (
            <Alert color="red" role="alert">
              {apiErrorMessage(error, "Не удалось создать единицу измерения")}
            </Alert>
          )}
          <TextInput
            label="Название"
            placeholder="Килограмм"
            size="lg"
            required
            maxLength={100}
            data-autofocus
            disabled={isLoading}
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Сокращение"
            placeholder="кг"
            size="lg"
            required
            maxLength={10}
            disabled={isLoading}
            {...form.getInputProps("shortName")}
          />
          <Group justify="flex-end">
            <Button
              type="button"
              size="lg"
              variant="default"
              disabled={isLoading}
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button type="submit" size="lg" loading={isLoading}>
              Создать
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
