import { notifications } from "@mantine/notifications";

export const useNotifications = () => {
  const showError = (message: string) => {
    notifications.show({
      title: "Ошибка",
      message: message,
      position: "bottom-right",
      color: "red",
      autoClose: 3000,
    });
  };

  const showSuccess = (message: string) => {
    notifications.show({
      title: " Успешно",
      message: message,
      position: "bottom-right",
      color: "green",
      autoClose: 3000,
    });
  };

  return { showError, showSuccess };
};
