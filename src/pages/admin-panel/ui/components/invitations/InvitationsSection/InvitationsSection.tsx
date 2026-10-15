import componentClasses from "./InvitationsSection.module.css";
import { SimpleGrid, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import TableLayout from "@/shared/ui/table-layout";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { invitationColumns } from "../../../../model/config";
import type { Invitation, InvitationRole } from "@/entities/invitation";
import { InvitationCreator } from "../InvitationCreator";
import { InvitationHelp } from "../InvitationHelp/InvitationHelp";
import { InvitationRow } from "../InvitationRow";

type Props = {
  invitations: Invitation[];
  restaurantId: string;
  onCreate: (role: InvitationRole, hours: number) => Promise<boolean>;
  onRevoke: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  latest: Invitation | null;
  busy?: boolean;
};
export function InvitationsSection({
  invitations,
  restaurantId,
  onCreate,
  onRevoke,
  onDelete,
  latest,
  busy,
}: Props) {
  const [confirmation, setConfirmation] = useState<{
    invitation: Invitation;
    action: "revoke" | "delete";
  } | null>(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <Stack className={componentClasses.invitations}>
      <SimpleGrid
        cols={{ base: 1, lg: 2 }}
        className={componentClasses.formSection}
      >
        <InvitationCreator
          restaurantId={restaurantId}
          latest={latest}
          busy={busy}
          now={now}
          onCreate={onCreate}
        />
        <InvitationHelp />
      </SimpleGrid>
      <TableLayout
        columns={invitationColumns}
        data={invitations}
        getRowKey={(invitation) => invitation.id}
        minWidth={1100}
        emptyText="Приглашений пока нет"
        renderRow={(invitation) => (
          <InvitationRow
            invitation={invitation}
            restaurantId={restaurantId}
            now={now}
            busy={busy}
            onRevoke={(item) =>
              setConfirmation({ invitation: item, action: "revoke" })
            }
            onDelete={(item) =>
              setConfirmation({ invitation: item, action: "delete" })
            }
          />
        )}
      />
      <ConfirmationModal
        opened={Boolean(confirmation)}
        title={
          confirmation?.action === "delete"
            ? "Удалить приглашение"
            : "Отключить приглашение"
        }
        message={`${confirmation?.action === "delete" ? "Удалить" : "Отключить"} приглашение ${confirmation?.invitation.id ?? ""}?`}
        warning="Эта ссылка больше не будет доступна для приглашения сотрудников."
        confirmText={
          confirmation?.action === "delete" ? "Удалить" : "Отключить"
        }
        cancelText="Отмена"
        loading={busy}
        onClose={() => !busy && setConfirmation(null)}
        onConfirm={async () => {
          if (confirmation && !busy && await
            (confirmation.action === "delete" ? onDelete : onRevoke)(
              confirmation.invitation.id,
            )) setConfirmation(null);
        }}
      />
    </Stack>
  );
}
