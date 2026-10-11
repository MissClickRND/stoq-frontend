import type {
  LoginRequest,
  EmployeeRegistrationRequest,
  RestaurantRegistrationRequest,
} from "../model/requests.ts";
export function submitLogin(_request: LoginRequest): void {
  //! Подключить авторизацию через authApi, сохранить сессию и перейти после успешного ответа.
}
export function submitEmployeeRegistration(
  _request: EmployeeRegistrationRequest,
): void {
  //! Подключить регистрацию сотрудника; показывать состояние заявки из ответа сервера.
}
export function submitRestaurantRegistration(
  _request: RestaurantRegistrationRequest,
): void {
  //! Подключить регистрацию заведения и владельца; показывать результат ответа сервера.
}

export function submitLogout(): void {
  //! Подключить выход через authApi; очищать сессию после ответа сервера.
}
