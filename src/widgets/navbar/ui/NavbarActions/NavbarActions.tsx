import componentClasses from "./NavbarActions.module.css";
import { useLogoutMutation } from "@/entities/auth";
import { Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { useNavigate } from "react-router-dom";
import classes from "../../classes/Navbar.module.css";
import { navbarActions } from "../../model/config";
import { NavbarSettings } from "../NavbarSettings";

export function NavbarActions() {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const submitLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      notifications.show({ color: "red", title: "Выход не выполнен",
        message: apiErrorMessage(error, "Сервер недоступен. Повторите выход после восстановления соединения.") });
    }
  };
  return <Stack gap={4} className={componentClasses.actions}>
    <NavbarSettings />
    {navbarActions.map(action => <Button key={action.label} onClick={submitLogout}
      loading={isLoading} className={classes.actionButton} variant="subtle"
      justify="start" leftSection={<action.icon size={20} />}>{action.label}</Button>)}
  </Stack>;
}
