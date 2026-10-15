import { createElement, useState } from "react";
import { Alert, Button, Group, Loader, Stack } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { apiErrorMessage } from "@/shared/lib/api-error";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useAdminPanel } from "../model/useAdminPanel";
import { adminTabs, adminStatistics, roleLabels } from "../model/config";
import { EstablishmentSection } from "./components/establishment/EstablishmentSection/EstablishmentSection";
import { EmployeesSection } from "./components/employees/EmployeesSection/EmployeesSection";
import { InvitationsSection } from "./components/invitations/InvitationsSection/InvitationsSection";

export function AdminPanelPage() {
  const admin = useAdminPanel();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const tab =
    requestedTab === "establishment" || requestedTab === "invitations"
      ? requestedTab
      : "employees";
  const currentQuery = tab === "employees" ? admin.employeesQuery : tab === "invitations" ? admin.invitationsQuery : admin.restaurantQuery;
  const [searchValue, setSearchValue] = useState("");
  const [search] = useDebouncedValue(searchValue, 200);
  const query = search.trim().toLocaleLowerCase("ru-RU");
  const matchingEmployees = admin.employees.filter((item) =>
    `${item.name} ${item.email} ${roleLabels[item.role]}`
      .toLocaleLowerCase("ru-RU")
      .includes(query),
  );
  const counts = {
    employees: admin.employees.length,
    invitations: admin.invitations.length,
    requests: admin.employees.filter((item) => item.status === "pending")
      .length,
    admins: admin.employees.filter((item) => item.role === "ADMIN").length,
  };
  const statisticData = adminStatistics.map((item) => ({
    title: item.title,
    description: item.description,
    value: (item.key === "invitations" ? admin.invitationsQuery.isError || admin.invitationsQuery.isLoading : admin.employeesQuery.isError || admin.employeesQuery.isLoading) ? "—" : counts[item.key],
    color: item.color,
    icon: createElement(item.icon),
  }));
  return (
    <DefaultPageLayout
      title="Админ-панель"
      subtitle="Управление заведением, сотрудниками и доступом"
      disableSearch={tab !== "employees"}
      searchTitle="Поиск сотрудника по имени, email или роли"
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      disableStatistics={tab !== "employees"}
      statisticData={statisticData}
      topSection={{
        items: adminTabs,
        value: tab,
        onChange: (value) => setParams({ tab: value }),
        ariaLabel: "Раздел админ-панели",
        rightSection:
          tab === "employees" ? (
            <Button
              size="lg"
              leftSection={<IconUserPlus size={20} />}
              onClick={() => setParams({ tab: "invitations" })}
            >
              Добавить сотрудника
            </Button>
          ) : undefined,
      }}
    >
      <Stack>
      {admin.actionError && <Alert color="red" role="alert">{admin.actionError}</Alert>}
      {currentQuery.isError &&
        <Alert color="red" role="alert"><Group justify="space-between">
          {apiErrorMessage(currentQuery.error, "Не удалось загрузить данные.")}
          <Button variant="light" loading={currentQuery.isFetching} onClick={() => currentQuery.refetch()}>Повторить</Button>
        </Group></Alert>}
      {currentQuery.isLoading ? <Loader aria-label="Загрузка данных" /> : currentQuery.isError && tab !== "establishment" ? null : tab === "establishment" ? (
        <EstablishmentSection
          draft={admin.draft}
          onChange={admin.setDraft}
          onSave={admin.saveRestaurant}
          onReset={admin.resetRestaurant}
          disabled={!admin.restaurant || admin.restaurantQuery.isError}
          saving={admin.saving}
        />
      ) : tab === "employees" ? (
        <EmployeesSection
          employees={matchingEmployees}
          onRoleChange={admin.changeRole}
          onToggleBlock={admin.toggleBlock}
          onApprove={admin.approveEmployee}
          busy={admin.employeeBusy}
        />
      ) : (
        <InvitationsSection
          invitations={admin.invitations}
          restaurantId={admin.restaurantId}
          latest={admin.latestInvitation}
          busy={admin.invitationBusy}
          onCreate={admin.createInvitation}
          onRevoke={admin.revokeInvitation}
          onDelete={admin.deleteInvitation}
        />
      )}
      </Stack>
    </DefaultPageLayout>
  );
}
