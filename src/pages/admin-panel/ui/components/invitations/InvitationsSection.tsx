import { SimpleGrid, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import TableLayout from "@/widgets/table-layout";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { invitationColumns } from "../../../model/data";
import type { Invitation, InvitationRole } from "../../../model/type";
import { InvitationCreator } from "./InvitationCreator";
import { InvitationHelp } from "./InvitationHelp";
import { InvitationRow } from "./InvitationRow";
import classes from "../../AdminPanel.module.css";

type Props = {
  invitations: Invitation[];
  restaurantId: string;
  onCreate: (role: InvitationRole, hours: number) => Invitation | null;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
};
export function InvitationsSection({
  invitations,
  restaurantId,
  onCreate,
  onRevoke,
  onDelete,
}: Props) {
  const [latestId, setLatestId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    invitation: Invitation;
    action: "revoke" | "delete";
  } | null>(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const latest = invitations.find((item) => item.id === latestId) ?? null;
  return (
    <Stack className={classes.invitations}>
      <SimpleGrid cols={{ base: 1, lg: 2 }} className={classes.formSection}>
        <InvitationCreator
          restaurantId={restaurantId}
          latest={latest}
          now={now}
          onCreate={onCreate}
          onCreated={(id) => {
            setLatestId(id);
            setNow(Date.now());
          }}
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
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (confirmation)
            (confirmation.action === "delete" ? onDelete : onRevoke)(
              confirmation.invitation.id,
            );
          setConfirmation(null);
        }}
      />
    </Stack>
  );
}
