import { Stack } from "@mantine/core";
import { useState } from "react";
import type { UserRole } from "@/entities/user";
import TableLayout from "@/widgets/table-layout";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import type { Employee } from "../../../model/type";
import { employeeColumns } from "../../../model/data";
import { EmployeeRow } from "./EmployeeRow";
import classes from "../../AdminPanel.module.css";

type Props = {
  employees: Employee[];
  onRoleChange: (id: string, role: UserRole) => void;
  onToggleBlock: (id: string) => void;
  onApprove: (id: string) => void;
};
export function EmployeesSection({
  employees,
  onRoleChange,
  onToggleBlock,
  onApprove,
}: Props) {
  const [blocking, setBlocking] = useState<Employee | null>(null);
  return (
    <Stack className={classes.employees}>
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
        onClose={() => setBlocking(null)}
        onConfirm={() => {
          if (blocking) onToggleBlock(blocking.id);
          setBlocking(null);
        }}
      />
    </Stack>
  );
}
