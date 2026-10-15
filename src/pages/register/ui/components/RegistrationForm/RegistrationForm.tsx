import { Alert, Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRegisterMutation } from "@/entities/auth";
import { isValidEmail, isValidPassword } from "@/shared/lib/auth-validation";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { employeeInitialValues, registrationCopy as copy } from "../../../model/config";
import classes from "@/shared/ui/auth-fields/classes/AuthFields.module.css";

export function RegistrationForm() {
  const [params] = useSearchParams();
  const [values, setValues] = useState(() => ({ ...employeeInitialValues, restaurantId: params.get("restaurantId") ?? "" }));
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [register, { isLoading, error, data }] = useRegisterMutation();
  const update = (field: keyof typeof values, value: string) => {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const id = Number(values.restaurantId);
    const next = {
      name: values.name.trim().length >= 2 && values.name.trim().length <= 100 ? undefined : copy.nameError,
      email: isValidEmail(values.email) ? undefined : copy.emailError,
      password: isValidPassword(values.password) ? undefined : "Пароль должен содержать минимум 4 символа",
      restaurantId: /^\d+$/.test(values.restaurantId) && Number.isSafeInteger(id) && id > 0 ? undefined : copy.restaurantError,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    try {
      await register({ fullName: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password, restaurantId: id }).unwrap();
      setValues(current => ({ ...current, password: "" }));
    } catch { /* Render the API error below, preserving the form for retry. */ }
  };
  if (data) return <Stack role="status">
    <Title order={2}>{copy.pendingTitle}</Title><Text>{data.message}</Text><Text>{copy.pendingMessage}</Text>
    <Button component={Link} to="/login">Перейти ко входу</Button>
  </Stack>;
  return <form onSubmit={submit} noValidate><Stack gap="md">
    {error && <Alert color="red" role="alert">{apiErrorMessage(error, copy.requestError)}</Alert>}
    <TextInput classNames={{ input: classes.input, section: classes.section }} size="lg" label={copy.name} placeholder="Иван Петров" autoComplete="name" value={values.name} maxLength={100}
      onChange={event => update("name", event.currentTarget.value)} error={errors.name} required />
    <TextInput classNames={{ input: classes.input, section: classes.section }} size="lg" label={copy.email} placeholder="employee@example.com" type="email" autoComplete="email" value={values.email}
      onChange={event => update("email", event.currentTarget.value)} error={errors.email} required />
    <PasswordInput classNames={{ input: classes.input, innerInput: classes.innerInput, section: classes.section }}
      visibilityToggleButtonProps={{ "aria-label": "Показать или скрыть пароль", color: "secondary.9" }} size="lg" label={copy.password} placeholder="Не менее 4 символов" autoComplete="new-password" value={values.password}
      onChange={event => update("password", event.currentTarget.value)} error={errors.password} required />
    <TextInput classNames={{ input: classes.input, section: classes.section }} size="lg" label={copy.restaurant} placeholder="Например, 7" inputMode="numeric" description={copy.restaurantDescription}
      value={values.restaurantId} onChange={event => update("restaurantId", event.currentTarget.value)} error={errors.restaurantId} required />
    <Button className={classes.submit} type="submit" size="lg" loading={isLoading}>{copy.submit}</Button>
    <Text size="sm" ta="center" className={classes.footer}>{copy.footer}</Text>
  </Stack></form>;
}
