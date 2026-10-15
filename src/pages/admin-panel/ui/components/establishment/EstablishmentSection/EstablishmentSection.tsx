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
import { useState, type FormEvent } from "react";
import { isValidEmail } from "@/shared/lib/auth-validation";
import type { RestaurantSettings } from "@/entities/restaurant";

type Props = {
  draft: RestaurantSettings;
  onChange: (draft: RestaurantSettings) => void;
  onSave: () => void;
  onReset: () => void;
  disabled?: boolean;
  saving?: boolean;
};
export function EstablishmentSection({
  draft,
  onChange,
  onSave,
  onReset,
  disabled,
  saving,
}: Props) {
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "address" | "email" | "phone", string>>
  >({});
  const update = (
    field: "name" | "address" | "email" | "phone",
    value: string,
  ) => {
    onChange({ ...draft, [field]: value });
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled || saving) return;
    const next = {
      name: draft.name.trim().length >= 2 ? undefined : "Укажите название ресторана (минимум 2 символа)",
      address: undefined,
      email: !draft.email.trim() || isValidEmail(draft.email) ? undefined : "Введите корректную почту",
      phone:
        !draft.phone.trim() || (/^\+?[\d\s()\-]{7,30}$/.test(draft.phone.trim()) &&
        draft.phone.replace(/\D/g, "").length >= 7)
          ? undefined
          : "Введите корректный телефон",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSave();
  };
  return (
    <Box className={componentClasses.content}>
      <form onSubmit={submit} noValidate>
        <Group justify="center" grow>
          <Fieldset
            disabled={disabled || saving}
            legend="Настройки заведения"
            className={componentClasses.fieldset}
          >
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  size="lg"
                  label="Название ресторана"
                  maxLength={100}
                  required
                  value={draft.name}
                  onChange={(event) =>
                    update("name", event.currentTarget.value)
                  }
                  error={errors.name}
                />
                <TextInput
                  size="lg"
                  label="Адрес ресторана"
                  maxLength={200}
                  value={draft.address}
                  onChange={(event) =>
                    update("address", event.currentTarget.value)
                  }
                  error={errors.address}
                />
                <TextInput
                  size="lg"
                  label="Email ресторана"
                  type="email"
                  maxLength={254}
                  value={draft.email}
                  onChange={(event) =>
                    update("email", event.currentTarget.value)
                  }
                  error={errors.email}
                />
                <TextInput
                  size="lg"
                  label="Телефон ресторана"
                  type="tel"
                  maxLength={30}
                  value={draft.phone}
                  onChange={(event) =>
                    update("phone", event.currentTarget.value)
                  }
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
                <Button type="submit" loading={saving}>Сохранить изменения</Button>
              </Group>
            </Stack>
          </Fieldset>
        </Group>
      </form>
    </Box>
  );
}
