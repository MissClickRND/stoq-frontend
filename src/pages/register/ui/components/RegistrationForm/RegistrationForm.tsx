import { Alert, Button, PasswordInput, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRegisterMutation } from "@/entities/auth";
import { useRestaurantsQuery } from "@/entities/restaurant";
import { isValidEmail, isValidPassword } from "@/shared/lib/auth-validation";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { employeeInitialValues, registrationCopy as copy } from "../../../model/config";
import classes from "@/shared/ui/auth-fields/classes/AuthFields.module.css";

export function RegistrationForm() {
  const [params] = useSearchParams();
  const [values, setValues] = useState(() => ({ ...employeeInitialValues, restaurantId: params.get("restaurantId") ?? "" }));
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [register, { isLoading, error, data }] = useRegisterMutation();
  const restaurants = useRestaurantsQuery();
  const invitationId = params.get("invitationId") ?? params.get("invitation");
  const restaurantOptions = (restaurants.data ?? []).map(restaurant => ({
    value: String(restaurant.id), label: `${restaurant.name}${restaurant.address ? ` · ${restaurant.address}` : ""} (№${restaurant.id})`,
  }));
  const update = (field: keyof typeof values, value: string) => {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading || restaurants.isFetching || restaurants.isError) return;
    const id = Number(values.restaurantId);
    const next = {
      name: values.name.trim().length >= 2 && values.name.trim().length <= 100 ? undefined : copy.nameError,
      email: isValidEmail(values.email) ? undefined : copy.emailError,
      password: isValidPassword(values.password) ? undefined : "Пароль должен содержать минимум 4 символа",
      restaurantId: Number.isSafeInteger(id) && id > 0 && restaurantOptions.some(item => item.value === values.restaurantId) ? undefined : copy.restaurantError,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    try {
      await register({ fullName: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password, restaurantId: id,
        ...(invitationId ? { invitationId } : {}) }).unwrap();
      setValues(current => ({ ...current, password: "" }));
    } catch { /* Render the API error below, preserving the form for retry. */ }
  };
  if (data) return <Stack role="status">
    <Title order={2}>{data.user.role === "WAIT_CONFIRM" ? copy.pendingTitle : "Регистрация завершена"}</Title><Text>{data.message}</Text>
    <Text>{data.user.role === "WAIT_CONFIRM" ? copy.pendingMessage : "Приглашение принято. Войдите с указанными почтой и паролем."}</Text>
    <Button component={Link} to="/login">Перейти ко входу</Button>
  </Stack>;
  return <form onSubmit={submit} noValidate><Stack gap="md">
    {error && <Alert color="red" role="alert">{apiErrorMessage(error, copy.requestError)}</Alert>}
    {restaurants.isError && <Alert color="red" role="alert">{apiErrorMessage(restaurants.error, "Не удалось загрузить заведения.")}
      <Button variant="light" size="xs" onClick={() => restaurants.refetch()} loading={restaurants.isFetching}>Повторить</Button></Alert>}
    <TextInput classNames={{ input: classes.input, section: classes.section }} size="lg" label={copy.name} placeholder="Иван Петров" autoComplete="name" value={values.name} maxLength={100}
      onChange={event => update("name", event.currentTarget.value)} error={errors.name} required />
    <TextInput classNames={{ input: classes.input, section: classes.section }} size="lg" label={copy.email} placeholder="employee@example.com" type="email" autoComplete="email" value={values.email}
      onChange={event => update("email", event.currentTarget.value)} error={errors.email} required />
    <PasswordInput classNames={{ input: classes.input, innerInput: classes.innerInput, section: classes.section }}
      visibilityToggleButtonProps={{ "aria-label": "Показать или скрыть пароль", color: "secondary.9" }} size="lg" label={copy.password} placeholder="Не менее 4 символов" autoComplete="new-password" value={values.password}
      onChange={event => update("password", event.currentTarget.value)} error={errors.password} required />
    <Select classNames={{ input: classes.input, section: classes.section }} size="lg" label={copy.restaurant}
      placeholder={restaurants.isLoading ? "Загрузка заведений…" : "Выберите заведение"} description={copy.restaurantDescription}
      searchable data={restaurantOptions} nothingFoundMessage="Заведения не найдены" allowDeselect={false}
      disabled={restaurants.isFetching || restaurants.isError || isLoading}
      value={values.restaurantId || null} onChange={value => update("restaurantId", value ?? "")}
      error={errors.restaurantId || (!restaurants.isLoading && !restaurants.isError && values.restaurantId && !restaurantOptions.some(item => item.value === values.restaurantId) ? "Заведение из ссылки не найдено. Выберите заведение из списка." : undefined)} required />
    {!restaurants.isLoading && !restaurants.isError && !restaurantOptions.length && <Text c="dimmed" size="sm">Пока нет доступных заведений.</Text>}
    <Button className={classes.submit} type="submit" size="lg" loading={isLoading} disabled={restaurants.isFetching || restaurants.isError || !restaurantOptions.length}>{copy.submit}</Button>
    <Text size="sm" ta="center" className={classes.footer}>{invitationId ? "Действующее приглашение предоставит доступ с назначенной ролью." : copy.footer}</Text>
  </Stack></form>;
}
