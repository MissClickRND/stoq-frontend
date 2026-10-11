export const registrationCopy = {
  title: "Регистрация сотрудника",
  description: "Отправьте запрос на присоединение к существующему заведению",
  name: "Имя и фамилия",
  email: "Почта",
  restaurant: "Компания / заведение",
  restaurantDescription: "Выберите из списка заведений",
  submit: "Отправить запрос",
  footer: "После одобрения управляющим вы получите доступ к системе.",
  pendingTitle: "Ваша заявка получена",
  pendingDescription:
    "Запрос на присоединение отправлен. Ожидайте решения управляющего ресторана.",
  pendingMessage: "После одобрения заявки вы сможете войти в аккаунт.",
  nameError: "Укажите имя и фамилию",
  emailError: "Введите корректную почту",
  restaurantError: "Выберите ресторан",
  requestError: "Не удалось отправить запрос. Попробуйте ещё раз.",
};

export const employeeInitialValues = { name: "", email: "", restaurantId: "" };

export const restaurantRegistrationCopy = {
  title: "Регистрация ресторана",
  description: "Создайте свой ресторан в системе",
  name: "Название заведения",
  city: "Город",
  email: "Почта",
  password: "Пароль",
  submit: "Создать ресторан",
  footer: "После регистрации вы сможете пригласить сотрудников.",
  nameError: "Укажите название заведения",
  cityError: "Укажите город",
  emailError: "Введите корректную почту",
  passwordError: "Пароль должен содержать минимум 6 символов",
  requestError: "Не удалось создать ресторан. Попробуйте ещё раз.",
  successTitle: "Ресторан создан",
  successDescription: "Вы стали главным управляющим своего ресторана.",
  successMessage:
    "Теперь вы можете управлять заведением и принимать заявки сотрудников.",
  continue: "Перейти в ресторан",
};

export const restaurantInitialValues = {
  name: "",
  city: "",
  email: "",
  password: "",
};
