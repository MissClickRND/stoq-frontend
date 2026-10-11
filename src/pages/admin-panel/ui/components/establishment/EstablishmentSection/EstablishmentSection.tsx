import componentClasses from "./EstablishmentSection.module.css";
import {
  Box,
  Button,
  Fieldset,
  Group,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, type FormEvent } from "react";
import { isValidEmail } from "@/shared/lib/auth-validation";
import type { RestaurantSettings } from "@/entities/restaurant";

type Props = {
  draft: RestaurantSettings;
  onChange: (draft: RestaurantSettings) => void;
  onSave: () => void;
  onReset: () => void;
};
export function EstablishmentSection({
  draft,
  onChange,
  onSave,
  onReset,
}: Props) {
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "city" | "email" | "phone", string>>
  >({});
  const update = (
    field: "name" | "city" | "email" | "phone",
    value: string,
  ) => {
    onChange({ ...draft, [field]: value });
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      name: draft.name.trim() ? undefined : "Укажите название ресторана",
      city: draft.city.trim() ? undefined : "Укажите город",
      email: isValidEmail(draft.email) ? undefined : "Введите корректную почту",
      phone:
        /^\+?[\d\s()\-]{7,25}$/.test(draft.phone.trim()) &&
        draft.phone.replace(/\D/g, "").length >= 7
          ? undefined
          : "Введите корректный телефон",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSave();
    notifications.show({
      title: "Изменения сохранены",
      message: "Настройки заведения обновлены локально",
      color: "green",
    });
  };
  return (
    <Box className={componentClasses.content}>
      <form onSubmit={submit} noValidate>
        <Fieldset
          legend="Настройки заведения"
          className={componentClasses.fieldset}
        >
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                size="lg"
                label="Название ресторана"
                required
                value={draft.name}
                onChange={(event) => update("name", event.currentTarget.value)}
                error={errors.name}
              />
              <TextInput
                size="lg"
                label="Город"
                required
                value={draft.city}
                onChange={(event) => update("city", event.currentTarget.value)}
                error={errors.city}
              />
              <TextInput
                size="lg"
                label="Email ресторана"
                type="email"
                required
                value={draft.email}
                onChange={(event) => update("email", event.currentTarget.value)}
                error={errors.email}
              />
              <TextInput
                size="lg"
                label="Телефон ресторана"
                type="tel"
                required
                value={draft.phone}
                onChange={(event) => update("phone", event.currentTarget.value)}
                error={errors.phone}
              />
            </SimpleGrid>
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  onReset();
                  setErrors({});
                }}
              >
                Отмена
              </Button>
              <Button type="submit">Сохранить изменения</Button>
            </Group>
          </Stack>
        </Fieldset>
      </form>
    </Box>
  );
}
