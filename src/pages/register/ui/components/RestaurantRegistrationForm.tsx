import {
  Alert,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconBuildingStore,
  IconLock,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { submitMockRestaurantRegistration } from "@/shared/api/auth-mock";
import type { MockRestaurant } from "@/shared/api/auth-mock/type";
import { isValidEmail, isValidPassword } from "@/shared/lib/auth-validation";
import {
  restaurantInitialValues,
  restaurantRegistrationCopy as copy,
} from "../../model/data";
import classes from "@/shared/ui/auth-fields/AuthFields.module.css";

export function RestaurantRegistrationForm({
  onSubmit,
}: {
  onSubmit: (restaurant: MockRestaurant) => void;
}) {
  const [values, setValues] = useState(restaurantInitialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof values, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = {
      name: values.name.trim() ? undefined : copy.nameError,
      city: values.city.trim() ? undefined : copy.cityError,
      email: isValidEmail(values.email) ? undefined : copy.emailError,
      password: isValidPassword(values.password)
        ? undefined
        : copy.passwordError,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSubmitting(true);
    setRequestError(null);
    try {
      const result = await submitMockRestaurantRegistration({
        ...values,
        name: values.name.trim(),
        city: values.city.trim(),
        email: values.email.trim(),
      });
      onSubmit(result.restaurant);
    } catch {
      setRequestError(copy.requestError);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {requestError && <Alert color="red">{requestError}</Alert>}
        <TextInput
          size="lg"
          placeholder={copy.name}
          aria-label={copy.name}
          autoComplete="organization"
          leftSection={<IconBuildingStore size={22} />}
          classNames={{ input: classes.input, section: classes.section }}
          value={values.name}
          onChange={(event) => updateValue("name", event.currentTarget.value)}
          error={errors.name}
        />
        <TextInput
          size="lg"
          placeholder={copy.city}
          aria-label={copy.city}
          autoComplete="address-level2"
          leftSection={<IconMapPin size={22} />}
          classNames={{ input: classes.input, section: classes.section }}
          value={values.city}
          onChange={(event) => updateValue("city", event.currentTarget.value)}
          error={errors.city}
        />
        <TextInput
          size="lg"
          placeholder={copy.email}
          aria-label={copy.email}
          type="email"
          autoComplete="email"
          leftSection={<IconMail size={22} />}
          classNames={{ input: classes.input, section: classes.section }}
          value={values.email}
          onChange={(event) => updateValue("email", event.currentTarget.value)}
          error={errors.email}
        />
        <PasswordInput
          size="lg"
          placeholder={copy.password}
          aria-label={copy.password}
          autoComplete="new-password"
          leftSection={<IconLock size={22} />}
          classNames={{
            input: classes.input,
            innerInput: classes.innerInput,
            section: classes.section,
          }}
          value={values.password}
          onChange={(event) =>
            updateValue("password", event.currentTarget.value)
          }
          error={errors.password}
          visibilityToggleButtonProps={{
            "aria-label": "Показать или скрыть пароль",
            color: "secondary.9",
          }}
        />
        <Button
          className={classes.submit}
          type="submit"
          size="lg"
          fullWidth
          mt="sm"
          loading={submitting}
        >
          {copy.submit}
        </Button>
        <Text className={classes.footer} size="sm" ta="center">
          {copy.footer}
        </Text>
      </Stack>
    </form>
  );
}
