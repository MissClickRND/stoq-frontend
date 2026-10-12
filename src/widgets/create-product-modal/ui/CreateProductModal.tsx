import { Button, Group, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useUnits } from "@/entities/unit";

function CreateProductForm({ initialName, onClose }: {
  initialName: string;
  onClose: () => void;
}) {
  const { units } = useUnits();
  const form = useForm({
    initialValues: { name: initialName, unitId: "" },
    validateInputOnBlur: true,
    validate: {
      name: (value) => !value.trim()
        ? "Введите название продукта"
        : value.trim().length > 100 ? "Не более 100 символов" : null,
      unitId: (value) => units.includes(value) ? null : "Выберите единицу измерения",
    },
  });

  return (
    <form noValidate onSubmit={form.onSubmit((values) => {
      //! Подключить создание продукта после появления API; пока выводим только черновик.
      //! Заменить строковые ключи текущего справочника единиц на серверные unitId.
      console.log({ name: values.name.trim(), unitId: values.unitId });
    })}>
      <Stack gap="md">
        <TextInput
          label="Название"
          placeholder="Введите название продукта"
          size="lg"
          required
          maxLength={100}
          data-autofocus
          {...form.getInputProps("name")}
        />
        <Select
          label="Единица измерения"
          placeholder="Выберите единицу измерения"
          size="lg"
          required
          data={units}
          {...form.getInputProps("unitId")}
        />
        <Group justify="flex-end">
          <Button type="button" size="lg" variant="default" onClick={onClose}>Отмена</Button>
          <Button type="submit" size="lg">Создать продукт</Button>
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
