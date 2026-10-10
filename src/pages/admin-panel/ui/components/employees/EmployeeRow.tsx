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
import type { UserRole } from "@/entities/user";
import type { Employee } from "../../../model/type";
import {
  employeeStatusLabels,
  roleLabels,
  roleOptions,
} from "../../../model/data";
import { formatDate, initials } from "../../../model/helpers";

type Props = {
  employee: Employee;
  onRoleChange: (id: string, role: UserRole) => void;
  onBlock: (employee: Employee) => void;
  onApprove: (id: string) => void;
};
export function EmployeeRow({
  employee,
  onRoleChange,
  onBlock,
  onApprove,
}: Props) {
  const status = employeeStatusLabels[employee.status];
  const owner = employee.role === "OWNER";
  return (
    <Table.Tr>
      <Table.Td>
        <Group wrap="nowrap" miw={240}>
          <Avatar color={employee.avatarColor} radius="xl">
            {initials(employee.name)}
          </Avatar>
          <Box>
            <Text size="md" fw={600}>
              {employee.name}
            </Text>
            <Text size="sm" c="dimmed">
              {roleLabels[employee.role]}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{employee.email}</Text>
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
        <Text size="sm">{formatDate(employee.joinedAt)}</Text>
      </Table.Td>
      <Table.Td>
        <Select
          w={190}
          size="sm"
          aria-label={`Изменить роль: ${employee.name}`}
          data={roleOptions}
          value={employee.role}
          disabled={owner}
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
                variant="light"
                size="lg"
                aria-label={`Одобрить доступ: ${employee.name}`}
                onClick={() => onApprove(employee.id)}
              >
                <IconCheck size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip
            label={
              owner
                ? "Управляющего нельзя заблокировать"
                : employee.status === "blocked"
                  ? "Разблокировать"
                  : "Заблокировать"
            }
          >
            <ActionIcon
              disabled={owner}
              color={employee.status === "blocked" ? "green" : "red"}
              variant="light"
              size="lg"
              aria-label={`${employee.status === "blocked" ? "Разблокировать" : "Заблокировать"}: ${employee.name}`}
              onClick={() => onBlock(employee)}
            >
              {employee.status === "blocked" ? (
                <IconLockOpen size={18} />
              ) : (
                <IconLock size={18} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
