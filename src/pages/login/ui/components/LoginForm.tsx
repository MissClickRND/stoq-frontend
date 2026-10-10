import {
  Alert,
  Button,
  Divider,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconLock, IconMail } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isValidEmail, isValidPassword } from "@/shared/lib/auth-validation";
import { loginCopy, loginInitialValues } from "../../model/data";
import { submitMockLogin } from "@/shared/api/auth-mock";
import classes from "@/shared/ui/auth-fields/AuthFields.module.css";

export function LoginForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState(loginInitialValues);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = {
      email: isValidEmail(values.email) ? undefined : loginCopy.emailError,
      password: isValidPassword(values.password)
        ? undefined
        : loginCopy.passwordError,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setSubmitting(true);
    setRequestError(null);
    try {
      await submitMockLogin({
        email: values.email.trim(),
        password: values.password,
      });
      navigate("/dashboard", { replace: true });
    } catch {
      setRequestError(loginCopy.requestError);
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
          size="lg"
          fullWidth
          mt="sm"
          loading={submitting}
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
