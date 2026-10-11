import { mockInvitations } from "../model/mock.ts";
import type { InvitationRole } from "../model/type.ts";
export function useInvitations() {
  //! Подключить запрос приглашений текущего заведения.
  return { invitations: mockInvitations };
}
export function createInvitation(_role: InvitationRole, _hours: number): void {
  //! Подключить создание приглашения; ID и срок действия получать от сервера.
}
export function revokeInvitation(_id: string): void {
  //! Подключить отзыв приглашения.
}
export function deleteInvitation(_id: string): void {
  //! Подключить удаление приглашения.
}
