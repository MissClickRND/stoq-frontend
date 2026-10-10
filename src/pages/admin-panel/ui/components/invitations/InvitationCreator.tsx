import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState, type FormEvent } from "react";
import {
  initialInvitationForm,
  invitationDurationOptions,
  invitationRoleOptions,
} from "../../../model/data";
import { invitationStatus, invitationUrl } from "../../../model/helpers";
import type { Invitation, InvitationRole } from "../../../model/type";
import { CopyInvitationButton } from "./CopyInvitationButton";

type Props = {
  restaurantId: string;
  latest: Invitation | null;
  now: number;
  onCreate: (role: InvitationRole, hours: number) => Invitation | null;
  onCreated: (id: string) => void;
};
export function InvitationCreator({
  restaurantId,
  latest,
  now,
  onCreate,
  onCreated,
}: Props) {
  const [values, setValues] = useState<{ role: InvitationRole; hours: string }>(
    initialInvitationForm,
  );
  const url = latest ? invitationUrl(latest.id, restaurantId) : "";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const invitation = onCreate(values.role, Number(values.hours));
    if (invitation) onCreated(invitation.id);
  };
  return (
    <Paper withBorder p="md">
      <Stack gap="md">
        <Stack gap={4}>
          <Title order={3} size="h5">
            Приглашение сотрудников
          </Title>
          <Text size="sm" c="dimmed">
            Создайте временную ссылку для присоединения к вашему заведению.
          </Text>
        </Stack>
        <form onSubmit={submit}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Select
                size="lg"
                label="Роль для приглашения"
                required
                data={invitationRoleOptions}
                value={values.role}
                allowDeselect={false}
                onChange={(value) =>
                  value &&
                  setValues({ ...values, role: value as InvitationRole })
                }
              />
              <Select
                size="lg"
                label="Срок действия ссылки"
                required
                data={invitationDurationOptions}
                value={values.hours}
                allowDeselect={false}
                onChange={(value) =>
                  value && setValues({ ...values, hours: value })
                }
              />
            </SimpleGrid>
            <TextInput
              size="lg"
              label="Сгенерированная ссылка"
              value={url}
              readOnly
              placeholder="Сначала создайте ссылку"
            />
            <Group justify="flex-end">
              <CopyInvitationButton
                url={url}
                disabled={!latest || invitationStatus(latest, now) !== "active"}
              />
              <Button type="submit">Создать ссылку</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
