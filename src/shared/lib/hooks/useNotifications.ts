import { notifications } from "@mantine/notifications";

export const useNotifications = (
  position: "top-right" | "bottom-right" = "bottom-right",
) => {
  const showError = (message: string) => {
    notifications.show({
      title: "Ошибка",
      message: message,
      position,
      color: "red",
      autoClose: 3000,
    });
  };

  const showSuccess = (message: string) => {
    notifications.show({
      title: " Успешно",
      message: message,
      position,
      color: "green",
      autoClose: 3000,
    });
  };

  return { showError, showSuccess };
};
