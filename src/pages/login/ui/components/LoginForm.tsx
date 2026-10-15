import {
  Button,
  Alert,
  Divider,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconLock, IconMail } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { isValidEmail, isValidPassword } from "@/shared/lib/auth-validation";
import { loginCopy, loginInitialValues } from "../../model/config";
import { useLoginMutation } from "@/entities/auth";
import { canAccessPath, roleHome } from "@/entities/user";
import { useNavigate, useLocation } from "react-router-dom";
import { apiErrorMessage } from "@/shared/lib/api-error";
import classes from "@/shared/ui/auth-fields/classes/AuthFields.module.css";

export function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState(loginInitialValues);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const nextErrors = {
      email: isValidEmail(values.email) ? undefined : loginCopy.emailError,
      password: isValidPassword(values.password)
        ? undefined
        : loginCopy.passwordError,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    try {
      const { user } = await login({ email: values.email.trim().toLowerCase(), password: values.password }).unwrap();
      const from: unknown = location.state?.from;
      const destination = typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
        && canAccessPath(user.role, from.split("?")[0]) ? from : roleHome(user.role);
      navigate(destination, { replace: true });
    } catch { /* Render server validation and connection errors below. */ }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {error && <Alert color="red" role="alert">{apiErrorMessage(error, loginCopy.requestError)}</Alert>}
        <TextInput
          size="lg"
          placeholder={loginCopy.email}
          aria-label={loginCopy.email}
          autoComplete="email"
          type="email"
          leftSection={<IconMail size={22} />}
          classNames={{ input: classes.input, section: classes.section }}
          value={values.email}
          onChange={(event) => updateValue("email", event.currentTarget.value)}
          error={errors.email}
        />
        <PasswordInput
          size="lg"
          placeholder={loginCopy.password}
          aria-label={loginCopy.password}
          autoComplete="current-password"
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
          loading={isLoading}
          size="lg"
          fullWidth
          mt="sm"
        >
          {loginCopy.submit}
        </Button>
        <Divider color="gray.2" mt="sm" />
        <Text size="sm" ta="center" className={classes.footer}>
          {loginCopy.footer}
        </Text>
      </Stack>
    </form>
  );
}
