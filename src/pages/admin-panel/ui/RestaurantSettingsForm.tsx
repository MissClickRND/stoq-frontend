import { useState, type FormEvent } from "react";
import { Alert, Button, Paper, Stack, Text, TextInput } from "@mantine/core";
import { useUpdateRestaurantMutation } from "@/entities/auth";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { isValidEmail } from "@/shared/lib/auth-validation";

const initial = { name: "", address: "", email: "", phone: "" };
export function RestaurantSettingsForm() {
  const [values, setValues] = useState(initial);
  const [update, { isLoading, error, data }] = useUpdateRestaurantMutation();
  const [validation, setValidation] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const body = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value));
    if (!Object.keys(body).length) { setValidation("Заполните хотя бы одно поле для изменения."); return; }
    if ((body.name && body.name.length < 2) || (body.email && !isValidEmail(body.email))) {
      setValidation("Проверьте название (минимум 2 символа) и email."); return;
    }
    setValidation(null);
    try { await update(body).unwrap(); setValues(initial); } catch { /* Display the server error. */ }
  };
  return <Paper withBorder p="lg"><form onSubmit={submit} noValidate><Stack>
    <Text fw={600}>Изменение информации о ресторане</Text>
    <Text c="dimmed" size="sm">Заполните только поля, которые хотите изменить. Текущие настройки сервер отдельным запросом не возвращает.</Text>
    {data && <Alert color="green" role="status">Сохранено: {data.name}, {data.address || "адрес не указан"}{data.email ? " · " + data.email : ""}{data.phone ? " · " + data.phone : ""}</Alert>}
    {(error || validation) && <Alert color="red" role="alert">{validation ?? apiErrorMessage(error, "Не удалось сохранить настройки.")}</Alert>}
    {(["name", "address", "email", "phone"] as const).map(key => <TextInput key={key}
      label={{ name: "Название ресторана", address: "Адрес", email: "Email ресторана", phone: "Телефон" }[key]}
      type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
      maxLength={{ name: 100, address: 200, email: 254, phone: 30 }[key]} value={values[key]}
      onChange={event => { const value = event.currentTarget.value; setValues(current => ({ ...current, [key]: value })); }} />)}
    <Button type="submit" loading={isLoading}>Сохранить изменения</Button>
  </Stack></form></Paper>;
}
