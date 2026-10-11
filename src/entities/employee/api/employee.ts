import { mockEmployees } from "../model/mock.ts";
import type { UserRole } from "../../user/@x/employee.ts";
export function useEmployees() {
  //! Подключить запрос сотрудников текущего заведения.
  return { employees: mockEmployees };
}
export function changeRole(_id: string, _role: UserRole): void {
  //! Подключить изменение роли сотрудника.
}
export function toggleBlock(_id: string): void {
  //! Подключить блокировку/разблокировку сотрудника.
}
export function approveEmployee(_id: string): void {
  //! Подключить одобрение запроса доступа сотрудника.
}
