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
} from "../../../model/config";
import {
  invitationStatus,
  invitationUrl,
  type Invitation,
  type InvitationRole,
} from "@/entities/invitation";

import { CopyInvitationButton } from "./CopyInvitationButton";

type Props = {
  restaurantId: string;
  latest: Invitation | null;
  now: number;
  onCreate: (role: InvitationRole, hours: number) => void;
  busy?: boolean;
};
export function InvitationCreator({
  restaurantId,
  latest,
  now,
  onCreate,
  busy,
}: Props) {
  const [values, setValues] = useState<{ role: InvitationRole; hours: string }>(
    initialInvitationForm,
  );
  const url = latest ? invitationUrl(latest.id, restaurantId) : "";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!busy) onCreate(values.role, Number(values.hours));
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
                disabled={busy}
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
                disabled={busy}
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
              <Button type="submit" loading={busy}>Создать ссылку</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
