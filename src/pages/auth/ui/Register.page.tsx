import { useRegisterMutation } from "@/entities/auth";
import { setUser } from "@/entities/user/model/userSlice";

import { useAppDispatch, useNotifications } from "@/shared/lib";
import {
  Box,
  Button,
  Center,
  Anchor,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  LoadingOverlay,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";

import { useNavigate } from "react-router-dom";

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useNotifications();

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : "Введите корректный email",
      password: (v) =>
        v.length >= 4 ? null : "Пароль должен содержать минимум 4 символа",
      confirmPassword: (v, values) =>
        v === values.password ? null : "Пароли не совпадают",
    },
  });

  const handleSubmit = async () => {
    try {
      const data = await register(form.values).unwrap();
      dispatch(setUser(data));
      showSuccess("Вы зарегистрировались в аккаунт");
      navigate("/");
      form.reset();
    } catch (error: any) {
      showError(error.data.message);
    }
  };

  return (
    <Box
      mih="100vh"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--mantine-color-gray-0)",
      }}
    >
      <Paper w={500} p="lg" radius="md" shadow="md">
        <LoadingOverlay visible={isLoading} />
        <Stack gap="xl">
          {/* Лого */}
          <Center>
            <Text
              ff="'Playfair Display', serif"
              fw={400}
              fz={36}
              c="primary.6"
              style={{ letterSpacing: "4px", textTransform: "uppercase" }}
            >
              La Maison
            </Text>
          </Center>

          <Box w={40} h={1} bg="primary.6" mx="auto" />

          <Text
            fz="sm"
            c="dark.4"
            ta="center"
            style={{ letterSpacing: "1px", textTransform: "uppercase" }}
          >
            Регистрация
          </Text>

          {/* Форма */}
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="user@example.com"
                radius={0}
                styles={{
                  label: {
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontSize: 11,
                    marginBottom: 6,
                  },
                  input: { borderColor: "var(--mantine-color-gray-4)" },
                }}
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Пароль"
                placeholder="Минимум 4 символа"
                radius={0}
                styles={{
                  label: {
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontSize: 11,
                    marginBottom: 6,
                  },
                  input: { borderColor: "var(--mantine-color-gray-4)" },
                }}
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Подтверждение пароля"
                placeholder="Повторите пароль"
                radius={0}
                styles={{
                  label: {
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontSize: 11,
                    marginBottom: 6,
                  },
                  input: { borderColor: "var(--mantine-color-gray-4)" },
                }}
                {...form.getInputProps("confirmPassword")}
              />

              <Button
                type="submit"
                fullWidth
                radius={0}
                color="primary.6"
                mt="sm"
                size="md"
                style={{ letterSpacing: "2px", textTransform: "uppercase" }}
              >
                Создать аккаунт
              </Button>
            </Stack>
          </form>

          <Text fz="sm" c="dark.4" ta="center">
            Уже есть аккаунт?{" "}
            <Anchor
              c="primary.6"
              fw={500}
              onClick={() => navigate("/auth/login")}
              style={{ cursor: "pointer" }}
            >
              Войти
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Box>
  );
}
