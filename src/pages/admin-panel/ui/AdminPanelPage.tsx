import { createElement, useState } from "react";
import { Button } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import DefaultPageLayout from "@/widgets/default-page-layout";
import { useAdminPanel } from "../model/useAdminPanel";
import { adminTabs, adminStatistics, roleLabels } from "../model/data";
import { EstablishmentSection } from "./components/establishment/EstablishmentSection";
import { EmployeesSection } from "./components/employees/EmployeesSection";
import { InvitationsSection } from "./components/invitations/InvitationsSection";

export function AdminPanelPage() {
  const admin = useAdminPanel();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const tab =
    requestedTab === "establishment" || requestedTab === "invitations"
      ? requestedTab
      : "employees";
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
    value: counts[item.key],
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
      {tab === "establishment" ? (
        <EstablishmentSection
          draft={admin.draft}
          onChange={admin.setDraft}
          onSave={admin.saveRestaurant}
          onReset={admin.resetRestaurant}
        />
      ) : tab === "employees" ? (
        <EmployeesSection
          employees={matchingEmployees}
          onRoleChange={admin.changeRole}
          onToggleBlock={admin.toggleBlock}
          onApprove={admin.approveEmployee}
        />
      ) : (
        <InvitationsSection
          invitations={admin.invitations}
          restaurantId={admin.restaurant.id}
          onCreate={admin.createInvitation}
          onRevoke={admin.revokeInvitation}
          onDelete={admin.deleteInvitation}
        />
      )}
    </DefaultPageLayout>
  );
}
