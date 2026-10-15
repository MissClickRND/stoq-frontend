import { baseApi } from "@/shared/api";
import type { Invitation, InvitationRole } from "../model/type.ts";

export type InvitationResponse = {
  id: string; role: InvitationRole; createdAt: string; expiresAt: string;
  revokedAt: string | null; usedAt: string | null;
};
export const toInvitation = (item: InvitationResponse): Invitation => ({
  id: item.id, role: item.role, createdAt: item.createdAt, expiresAt: item.expiresAt,
  revoked: Boolean(item.revokedAt), usedAt: item.usedAt,
});
export const invitationsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    invitations: build.query<Invitation[], void>({
      query: () => "/auth/admin/invitations",
      transformResponse: (response: InvitationResponse[]) => response.map(toInvitation),
      providesTags: [{ type: "User", id: "INVITATIONS" }],
    }),
    createInvitation: build.mutation<Invitation, { role: InvitationRole; hours: number }>({
      query: body => ({ url: "/auth/admin/invitations", method: "POST", body }),
      transformResponse: toInvitation,
      invalidatesTags: ["Statistic", { type: "User", id: "INVITATIONS" }],
    }),
    revokeInvitation: build.mutation<unknown, string>({
      query: id => ({ url: `/auth/admin/invitations/${id}/revoke`, method: "PATCH" }),
      invalidatesTags: ["Statistic", { type: "User", id: "INVITATIONS" }],
    }),
    deleteInvitation: build.mutation<unknown, string>({
      query: id => ({ url: `/auth/admin/invitations/${id}`, method: "DELETE" }),
      invalidatesTags: ["Statistic", { type: "User", id: "INVITATIONS" }],
    }),
  }),
});
export const { useInvitationsQuery, useCreateInvitationMutation, useRevokeInvitationMutation, useDeleteInvitationMutation } = invitationsApi;
