import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconBan, IconTrash } from "@tabler/icons-react";
import { invitationStatusLabels, roleLabels } from "../../../model/data";
import {
  formatDate,
  invitationStatus,
  invitationUrl,
} from "../../../model/helpers";
import type { Invitation } from "../../../model/type";
import { CopyInvitationButton } from "./CopyInvitationButton";

type Props = {
  invitation: Invitation;
  restaurantId: string;
  now: number;
  onRevoke: (invitation: Invitation) => void;
  onDelete: (invitation: Invitation) => void;
};
export function InvitationRow({
  invitation,
  restaurantId,
  now,
  onRevoke,
  onDelete,
}: Props) {
  const status = invitationStatus(invitation, now);
  const label = invitationStatusLabels[status];
  const url = invitationUrl(invitation.id, restaurantId);
  return (
    <Table.Tr>
      <Table.Td>
        <Anchor
          href={url}
          size="sm"
          fw={600}
          maw={260}
          lineClamp={1}
          title={url}
        >
          {url}
        </Anchor>
        <Text size="xs" c="dimmed">
          Код: {invitation.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          {roleLabels[invitation.role]}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(invitation.createdAt, true)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(invitation.expiresAt, true)}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          size="lg"
          variant="light"
          color={label.color}
          tt="none"
          miw="max-content"
        >
          {label.label}
        </Badge>
        {invitation.usedBy && (
          <Text size="xs" c="dimmed" mt={4}>
            {invitation.usedBy}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <CopyInvitationButton
            url={url}
            compact
            disabled={status !== "active"}
          />
          <Tooltip label="Отключить ссылку">
            <ActionIcon
              aria-label="Отключить ссылку"
              variant="light"
              color="orange"
              size="lg"
              disabled={status !== "active"}
              onClick={() => onRevoke(invitation)}
            >
              <IconBan size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Удалить приглашение">
            <ActionIcon
              aria-label="Удалить приглашение"
              variant="light"
              color="red"
              size="lg"
              onClick={() => onDelete(invitation)}
            >
              <IconTrash size={17} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
