import { selectUser } from "@/entities/user/model/userSelectors";
import { UserRole } from "@/entities/user/model/type";
import { useAppSelector } from "@/shared/lib";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconChevronRight } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  {
    label: "Дашборды",
    link: "/employee/dashboards",
    roles: ["ADMIN"],
  },
  {
    label: "Пользователи",
    link: "/employee/users",
    roles: ["ADMIN"],
  },
  {
    label: "Ресторан",
    link: "/employee/edit-floor-scheme",
    roles: ["ADMIN"],
  },
  {
    label: "Брони",
    link: "/employee/reservations",
    roles: ["WAITER"],
  },
  {
    label: "Заказы",
    link: "/employee/orders",
    roles: ["WAITER"],
  },
  {
    label: "Готовые блюда",
    link: "/employee/ready-dishes",
    roles: ["WAITER"],
  },
  {
    label: "Очередь заказов",
    link: "/employee/queue-orders",
    roles: ["COOK"],
  },
];

const roleBadgeColor: Record<UserRole, string> = {
  ADMIN: "#8b1a2f",
  WAITER: "blue",
  COOK: "orange",
  CUSTOMER: "gray",
};

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Администратор",
  WAITER: "Официант",
  COOK: "Повар",
  CUSTOMER: "Клиент",
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  const role: UserRole = user?.role ?? "CUSTOMER";

  return (
    <Stack h="100%" p="md" gap="xs" justify="space-between">
      <Stack gap="xs">
        {/* Профиль пользователя */}
        <Stack align="center" gap={6} py="md">
          <Avatar size={64} radius="xl" color={roleBadgeColor[role]}>
            {user?.name
              ? user?.name[0]
              : user?.email
                ? user?.email[0].toUpperCase()
                : "—"}
          </Avatar>
          <Text fw={600} size="md" ta="center" lineClamp={1}>
            {user?.name ?? user?.email}
          </Text>
          <Badge color={roleBadgeColor[role]} variant="light" size="sm">
            {roleLabel[role]}
          </Badge>
        </Stack>

        <Divider />

        {/* Навигация */}
        <Stack gap={4} mt="xs">
          {links
            .filter((link) => link.roles.includes(role))
            .map((link) => (
              <NavLink
                key={link.link}
                label={link.label}
                active={location.pathname === link.link}
                onClick={() => navigate(link.link)}
                rightSection={<IconChevronRight size={14} stroke={1.5} />}
                styles={{ root: { borderRadius: 8 } }}
              />
            ))}
        </Stack>
      </Stack>

      <Box>
        <Divider mb="md" />
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          fullWidth
          onClick={() => navigate("/")}
        >
          На главную
        </Button>
      </Box>
    </Stack>
  );
}
