import { Alert, Button, Group, Loader, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useGetUnitsQuery } from "@/entities/unit";
import { useCreateProductMutation } from "@/entities/product";
import { useNotifications } from "@/shared/lib";
import { apiErrorMessage } from "@/shared/lib/api-error";

function CreateProductForm({ initialName, onClose }: {
  initialName: string;
  onClose: () => void;
}) {
  const { showSuccess, showError } = useNotifications("top-right");
  const { data: units = [], isLoading, isError, refetch } = useGetUnitsQuery();
  const [createProduct, { isLoading: saving }] = useCreateProductMutation();
  const form = useForm({
    initialValues: { name: initialName, unitId: "" },
    validateInputOnBlur: true,
    validate: {
      name: (value) => !value.trim()
        ? "Введите название продукта"
        : value.trim().length > 100 ? "Не более 100 символов" : null,
      unitId: (value) => units.some((unit) => String(unit.id) === value)
        ? null : "Выберите единицу измерения",
    },
  });

  return (
    <form noValidate onSubmit={form.onSubmit(async (values) => {
      try {
        await createProduct({ name: values.name.trim(), unitId: Number(values.unitId) }).unwrap();
        showSuccess("Продукт создан.");
        onClose();
      } catch (error) {
        showError(apiErrorMessage(error, "Не удалось создать продукт"));
      }
    })}>
      <Stack gap="md">
        {isError && (
          <Alert color="red" role="alert">
            Не удалось загрузить единицы измерения.
            <Button type="button" variant="subtle" onClick={() => refetch()}>Повторить</Button>
          </Alert>
        )}
        <TextInput
          label="Название"
          placeholder="Введите название продукта"
          size="lg"
          required
          maxLength={100}
          data-autofocus
          disabled={saving}
          {...form.getInputProps("name")}
        />
        <Select
          label="Единица измерения"
          placeholder="Выберите единицу измерения"
          size="lg"
          required
          disabled={isLoading || isError || saving}
          rightSection={isLoading ? <Loader size="sm" /> : undefined}
          data={units.map((unit) => ({ value: String(unit.id), label: `${unit.name} (${unit.shortName})` }))}
          {...form.getInputProps("unitId")}
        />
        <Group justify="flex-end">
          <Button type="button" size="lg" variant="default" disabled={saving} onClick={onClose}>Отмена</Button>
          <Button type="submit" size="lg" loading={saving} disabled={isLoading || isError}>Создать продукт</Button>
        </Group>
      </Stack>
    </form>
  );
}

export function CreateProductModal({ opened, onClose, initialName = "" }: {
  opened: boolean;
  onClose: () => void;
  initialName?: string;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Создание продукта" centered size="md">
      {opened && <CreateProductForm initialName={initialName} onClose={onClose} />}
    </Modal>
  );
}
