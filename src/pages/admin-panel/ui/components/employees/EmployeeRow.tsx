import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Select,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconLock, IconLockOpen } from "@tabler/icons-react";
import { selectUser, type UserRole } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import type { Employee } from "@/entities/employee";
import {
  employeeStatusLabels,
  roleLabels,
  roleOptions,
} from "../../../model/config";
import { formatDate, initials } from "@/shared/lib/format";

type Props = {
  employee: Employee;
  onRoleChange: (id: string, role: UserRole) => void;
  onBlock: (employee: Employee) => void;
  onApprove: (id: string) => void;
  busy?: boolean;
};
export function EmployeeRow({
  employee,
  onRoleChange,
  onBlock,
  onApprove,
  busy,
}: Props) {
  const status = employeeStatusLabels[employee.status];
  const currentUser = useAppSelector(selectUser);
  const ownAccount = employee.id === String(currentUser.id);
  return (
    <Table.Tr>
      <Table.Td>
        <Group wrap="nowrap" miw={240}>
          <Avatar color={employee.avatarColor} radius="xl">
            {initials(employee.name)}
          </Avatar>
          <Box>
            <Text size="lg" fw={600}>
              {employee.name}
            </Text>
            <Text size="sm" c="dimmed">
              {roleLabels[employee.role]}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="lg">{employee.email}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          size="lg"
          variant="light"
          color={status.color}
          tt="none"
          miw="max-content"
        >
          {status.label}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="lg">{formatDate(employee.joinedAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Select
          w={230}
          size="lg"
          aria-label={`Изменить роль: ${employee.name}`}
          data={employee.status === "pending" ? roleOptions.filter(option => option.value !== "ADMIN") : roleOptions}
          value={employee.role}
          disabled={ownAccount || busy}
          allowDeselect={false}
          onChange={(value) =>
            value && onRoleChange(employee.id, value as UserRole)
          }
        />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          {employee.status === "pending" && (
            <Tooltip label="Одобрить доступ">
              <ActionIcon
                color="green"
                disabled={busy}
                variant="light"
                size={50}
                aria-label={`Одобрить доступ: ${employee.name}`}
                onClick={() => onApprove(employee.id)}
              >
                <IconCheck size={20} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip
            label={
              ownAccount
                ? "Нельзя заблокировать свой аккаунт"
                : employee.status === "blocked"
                  ? "Разблокировать"
                  : "Заблокировать"
            }
          >
            <ActionIcon
              disabled={ownAccount || busy}
              color={employee.status === "blocked" ? "green" : "red"}
              variant="light"
              size={50}
              aria-label={`${employee.status === "blocked" ? "Разблокировать" : "Заблокировать"}: ${employee.name}`}
              onClick={() => onBlock(employee)}
            >
              {employee.status === "blocked" ? (
                <IconLockOpen size={20} />
              ) : (
                <IconLock size={20} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
