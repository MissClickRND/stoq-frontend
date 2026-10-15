export const registrationCopy = {
  title: "Регистрация сотрудника",
  description: "Отправьте запрос на присоединение к существующему заведению",
  name: "Имя и фамилия",
  email: "Почта",
  restaurant: "Заведение",
  password: "Пароль",

  submit: "Отправить запрос",
  footer: "После одобрения администратором вы получите доступ к системе.",
  pendingTitle: "Ваша заявка получена",
  pendingDescription: "Запрос отправлен администратору ресторана.",
  pendingMessage:
    "После одобрения заявки вы сможете войти с указанными почтой и паролем.",
  nameError: "Укажите имя и фамилию (от 2 до 100 символов)",
  emailError: "Введите корректную почту",
  restaurantError: "Выберите заведение из списка",
  requestError:
    "Не удалось отправить запрос. Проверьте соединение и попробуйте ещё раз.",
};
export const employeeInitialValues = {
  name: "",
  email: "",
  password: "",
  restaurantId: "",
};
export const restaurantRegistrationCopy = {
  title: "Регистрация ресторана",
  description: "Создайте свой ресторан в системе",
  name: "Название заведения",
  city: "Адрес ресторана",
  fullName: "Имя и фамилия администратора",
  email: "Почта",
  password: "Пароль",
  submit: "Создать ресторан",
  footer: "После регистрации войдите, чтобы принимать заявки сотрудников.",
  nameError: "Название должно содержать от 2 до 100 символов",
  cityError: "Адрес должен содержать не более 200 символов",
  emailError: "Введите корректную почту",
  passwordError: "Пароль должен содержать минимум 4 символа",
  requestError:
    "Не удалось создать ресторан. Проверьте соединение и попробуйте ещё раз.",
  successTitle: "Ресторан создан",
  successDescription: "Аккаунт администратора создан.",
  successMessage: "Войдите с указанными почтой и паролем.",
  continue: "Войти в ресторан",
};
export const restaurantInitialValues = {
  name: "",
  city: "",
  fullName: "",
  email: "",
  password: "",
};
