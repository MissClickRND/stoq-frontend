import { useState } from "react";
import { Alert, Anchor, Button, Group, Loader, Paper, Select, Stack, Table, Tabs, Text, TextInput } from "@mantine/core";
import { useApproveUserMutation, useDeleteEmployeeMutation, usePendingUsersQuery, type EmployeeRole } from "@/entities/auth";
import { roleLabels, selectUser } from "@/entities/user";
import { useAppSelector } from "@/shared/lib";
import { apiErrorMessage } from "@/shared/lib/api-error";
import { getPublicSiteOrigin } from "@/shared/lib/site-origin";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { RestaurantSettingsForm } from "./RestaurantSettingsForm";

const roles = (["MANAGER", "WAITER", "STOREKEEPER"] as const).map(value => ({ value, label: roleLabels[value] }));
export function AdminPanelPage() {
  const user = useAppSelector(selectUser);
  const pending = usePendingUsersQuery(undefined, { refetchOnFocus: true, refetchOnMountOrArgChange: true });
  const [approve, approval] = useApproveUserMutation();
  const [remove, removal] = useDeleteEmployeeMutation();
  const [selectedRoles, setSelectedRoles] = useState<Record<number, EmployeeRole>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const registrationUrl = new URL("/register/employee?restaurantId=" + user.restaurantId, getPublicSiteOrigin()).toString();
  const busy = approval.isLoading || removal.isLoading;
  const approveUser = async (id: number) => {
    setActionError(null); setMessage(null);
    try {
      await approve({ id, role: selectedRoles[id] ?? "WAITER" }).unwrap();
      setMessage("Сотрудник подтверждён и теперь может войти в систему.");
    } catch (error) { setActionError(apiErrorMessage(error, "Не удалось подтвердить сотрудника.")); }
  };
  const deleteUser = async () => {
    if (!deleting) return;
    setActionError(null); setMessage(null);
    try {
      await remove(deleting.id).unwrap();
      setDeleting(null); setEmployeeId(""); setMessage("Сотрудник удалён.");
    } catch (error) { setActionError(apiErrorMessage(error, "Не удалось удалить сотрудника.")); }
  };
  return <DefaultPageLayout title="Админ-панель" subtitle="Управление заведением и доступом сотрудников" disableSearch disableStatistics>
    <Stack>
      <Text fw={600}>ID вашего ресторана: {user.restaurantId}</Text>
      <Tabs defaultValue="employees">
        <Tabs.List><Tabs.Tab value="employees">Сотрудники</Tabs.Tab><Tabs.Tab value="establishment">Заведение</Tabs.Tab></Tabs.List>
        <Tabs.Panel value="employees" pt="lg"><Stack>
          <Paper withBorder p="lg"><Stack gap="sm">
            <Text fw={600}>Регистрация сотрудников</Text>
            <Text>Передайте сотруднику эту ссылку. После регистрации он появится в заявках ниже.</Text>
            <Anchor href={registrationUrl} style={{ overflowWrap: "anywhere" }}>{registrationUrl}</Anchor>
          </Stack></Paper>
          {actionError && <Alert color="red" role="alert">{actionError}</Alert>}
          {message && <Alert color="green" role="status">{message}</Alert>}
          <Group justify="space-between"><Text size="lg" fw={600}>Заявки на доступ</Text><Button variant="default" onClick={() => pending.refetch()} loading={pending.isFetching}>Обновить</Button></Group>
          {pending.isLoading ? <Loader /> : pending.isError ? <Alert color="red" role="alert">{apiErrorMessage(pending.error, "Не удалось загрузить заявки.")}</Alert> :
            !pending.data?.length ? <Text c="dimmed">Нет заявок на подтверждение.</Text> :
            <Table.ScrollContainer minWidth={760}><Table>
              <Table.Thead><Table.Tr><Table.Th>Сотрудник / ID</Table.Th><Table.Th>Email</Table.Th><Table.Th>Дата заявки</Table.Th><Table.Th>Роль</Table.Th><Table.Th>Действия</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>{pending.data.map(employee => <Table.Tr key={employee.id}>
                <Table.Td>{employee.fullName} · {employee.id}</Table.Td><Table.Td>{employee.email}</Table.Td>
                <Table.Td>{new Date(employee.createdAt).toLocaleDateString("ru-RU")}</Table.Td>
                <Table.Td><Select aria-label={"Роль для " + employee.fullName} data={roles} allowDeselect={false}
                  value={selectedRoles[employee.id] ?? "WAITER"} disabled={busy}
                  onChange={value => value && setSelectedRoles(current => ({ ...current, [employee.id]: value as EmployeeRole }))} /></Table.Td>
                <Table.Td><Group wrap="nowrap"><Button disabled={busy} onClick={() => approveUser(employee.id)}>Подтвердить</Button>
                  <Button color="red" variant="light" disabled={busy} onClick={() => setDeleting({ id: employee.id, name: employee.fullName })}>Отклонить</Button></Group></Table.Td>
              </Table.Tr>)}</Table.Tbody>
            </Table></Table.ScrollContainer>}
          <Paper withBorder p="lg"><Stack>
            <Text fw={600}>Удалить сотрудника по ID</Text>
            <Text size="sm" c="dimmed">Сервер возвращает только ожидающие заявки. Для удаления уже подтверждённого сотрудника укажите его ID.</Text>
            <Group align="end"><TextInput label="ID сотрудника" inputMode="numeric" value={employeeId} onChange={event => setEmployeeId(event.currentTarget.value)} />
              <Button color="red" disabled={busy || !/^\d+$/.test(employeeId) || !Number.isSafeInteger(Number(employeeId)) || Number(employeeId) <= 0 || Number(employeeId) === user.id}
                onClick={() => setDeleting({ id: Number(employeeId), name: "ID " + employeeId })}>Удалить</Button></Group>
          </Stack></Paper>
        </Stack></Tabs.Panel>
        <Tabs.Panel value="establishment" pt="lg"><RestaurantSettingsForm /></Tabs.Panel>
      </Tabs>
      <ConfirmationModal opened={Boolean(deleting)} title="Удалить сотрудника"
        message={"Удалить сотрудника «" + (deleting?.name ?? "") + "»?"} warning="Для доступа ему потребуется зарегистрироваться заново."
        loading={removal.isLoading}
        confirmText={removal.isLoading ? "Удаление…" : "Удалить"} cancelText="Отмена" onClose={() => !removal.isLoading && setDeleting(null)}
        onConfirm={() => !removal.isLoading && void deleteUser()} />
    </Stack>
  </DefaultPageLayout>;
}
