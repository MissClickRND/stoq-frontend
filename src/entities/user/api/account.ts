import { mockAccount } from "../model/mock.ts";
export function useAccount() {
  //! Подключить запрос текущего пользователя и его роли для навигации.
  return { account: mockAccount };
}
