import {
  Alert,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useRegisterRestaurantMutation } from "@/entities/auth";
import { isValidEmail, isValidPassword } from "@/shared/lib/auth-validation";
import { apiErrorMessage } from "@/shared/lib/api-error";
import {
  restaurantInitialValues,
  restaurantRegistrationCopy as copy,
} from "../../model/config";
import classes from "@/shared/ui/auth-fields/classes/AuthFields.module.css";

export function RestaurantRegistrationForm() {
  const [values, setValues] = useState(restaurantInitialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof values, string>>
  >({});
  const [register, { isLoading, error, data }] =
    useRegisterRestaurantMutation();
  const update = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const next = {
      name:
        values.name.trim().length >= 2 && values.name.trim().length <= 100
          ? undefined
          : copy.nameError,
      fullName:
        values.fullName.trim().length >= 2 &&
        values.fullName.trim().length <= 100
          ? undefined
          : "Укажите имя и фамилию (от 2 до 100 символов)",
      city: values.city.trim().length <= 200 ? undefined : copy.cityError,
      email: isValidEmail(values.email) ? undefined : copy.emailError,
      password: isValidPassword(values.password)
        ? undefined
        : copy.passwordError,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    try {
      await register({
        fullName: values.fullName.trim(),
        restaurantName: values.name.trim(),
        restaurantAddress: values.city.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();
      setValues((current) => ({ ...current, password: "" }));
    } catch {
      /* The error below allows retry without losing entered data. */
    }
  };
  if (data)
    return (
      <Stack role="status">
        <Title order={2}>{copy.successTitle}</Title>
        <Text>
          ID ресторана: {data.restaurant.id}. Передайте его сотрудникам для
          регистрации.
        </Text>
        <Text>{copy.successMessage}</Text>
        <Button component={Link} to="/login">
          {copy.continue}
        </Button>
      </Stack>
    );
  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {error && (
          <Alert color="red" role="alert">
            {apiErrorMessage(error, copy.requestError)}
          </Alert>
        )}
        <TextInput
          classNames={{ input: classes.input, section: classes.section }}
          size="lg"
          label={copy.fullName}
          placeholder="Иван Петров"
          autoComplete="name"
          value={values.fullName}
          maxLength={100}
          onChange={(event) => update("fullName", event.currentTarget.value)}
          error={errors.fullName}
          required
        />
        <TextInput
          classNames={{ input: classes.input, section: classes.section }}
          size="lg"
          label={copy.name}
          placeholder="Клод моне"
          autoComplete="organization"
          value={values.name}
          maxLength={100}
          onChange={(event) => update("name", event.currentTarget.value)}
          error={errors.name}
          required
        />
        <TextInput
          classNames={{ input: classes.input, section: classes.section }}
          size="lg"
          label={copy.city}
          placeholder="Москва, ул. Пушкина, д. 10"
          autoComplete="street-address"
          value={values.city}
          maxLength={200}
          onChange={(event) => update("city", event.currentTarget.value)}
          error={errors.city}
        />
        <TextInput
          classNames={{ input: classes.input, section: classes.section }}
          size="lg"
          label={copy.email}
          placeholder="owner@example.com"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.currentTarget.value)}
          error={errors.email}
          required
        />
        <PasswordInput
          classNames={{
            input: classes.input,
            innerInput: classes.innerInput,
            section: classes.section,
          }}
          visibilityToggleButtonProps={{
            "aria-label": "Показать или скрыть пароль",
            color: "secondary.9",
          }}
          size="lg"
          label={copy.password}
          placeholder="Не менее 4 символов"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update("password", event.currentTarget.value)}
          error={errors.password}
          required
        />
        <Button
          className={classes.submit}
          type="submit"
          size="lg"
          loading={isLoading}
        >
          {copy.submit}
        </Button>
        <Text size="sm" ta="center" className={classes.footer}>
          {copy.footer}
        </Text>
      </Stack>
    </form>
  );
}
