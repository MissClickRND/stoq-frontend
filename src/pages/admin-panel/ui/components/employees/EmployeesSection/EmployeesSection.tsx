import componentClasses from "./EmployeesSection.module.css";
import { Stack } from "@mantine/core";
import { useState } from "react";
import type { UserRole } from "@/entities/user";
import TableLayout from "@/shared/ui/table-layout";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import type { Employee } from "@/entities/employee";
import { employeeColumns } from "../../../../model/config";
import { EmployeeRow } from "../EmployeeRow";

type Props = {
  employees: Employee[];
  onRoleChange: (id: string, role: UserRole) => void;
  onToggleBlock: (id: string) => Promise<boolean>;
  onApprove: (id: string) => void;
  busy?: boolean;
};
export function EmployeesSection({
  employees,
  onRoleChange,
  onToggleBlock,
  onApprove,
  busy,
}: Props) {
  const [blocking, setBlocking] = useState<Employee | null>(null);
  return (
    <Stack className={componentClasses.employees}>
      <TableLayout
        columns={employeeColumns}
        data={employees}
        getRowKey={(employee) => employee.id}
        emptyText="Сотрудники не найдены"
        minWidth={1100}
        renderRow={(employee) => (
          <EmployeeRow
            employee={employee}
            onRoleChange={onRoleChange}
            onApprove={onApprove}
            busy={busy}
            onBlock={(item) =>
              item.status === "blocked"
                ? onToggleBlock(item.id)
                : setBlocking(item)
            }
          />
        )}
      />
      <ConfirmationModal
        opened={Boolean(blocking)}
        title="Заблокировать сотрудника"
        message={`Заблокировать доступ сотрудника «${blocking?.name ?? ""}» к ресторану?`}
        warning="Сотрудник потеряет доступ к заведению до разблокировки."
        confirmText="Заблокировать"
        cancelText="Отмена"
        loading={busy}
        onClose={() => !busy && setBlocking(null)}
        onConfirm={async () => {
          if (blocking && !busy && await onToggleBlock(blocking.id)) setBlocking(null);
        }}
      />
    </Stack>
  );
}
