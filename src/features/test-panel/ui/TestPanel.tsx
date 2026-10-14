import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Text,
} from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function TestPanel() {
  const navigate = useNavigate();
  return (
    <Center w="100%" h="100vh">
      <Paper w={500} h={300} p="lg" shadow="sm">
        <Group justify="space-between">
          <Text fz={24} fw={700}>
            Панель тестирования
          </Text>
          <ActionIcon size="lg" onClick={() => navigate("/")}>
            <IconHome />
          </ActionIcon>
        </Group>

        <Divider my="sm" />
        <Group>
          <Button>Заполнить БД ресторана</Button>
          <Button>Создать очередь задач</Button>
        </Group>
      </Paper>
    </Center>
  );
}
