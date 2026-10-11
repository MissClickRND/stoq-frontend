import componentClasses from "./InvitationHelp.module.css";
import { Paper, Text, Timeline, Title } from "@mantine/core";
import { invitationSteps } from "../../../../model/config";

export function InvitationHelp() {
  return (
    <Paper withBorder p="md" h="100%">
      <Title order={3} size="h5" mb="md">
        Как это работает
      </Title>
      <Timeline
        active={2}
        bulletSize={28}
        lineWidth={2}
        color="primary"
        classNames={{ itemBullet: componentClasses.timelineBullet }}
      >
        {invitationSteps.map((step, index) => (
          <Timeline.Item key={step.title} title={step.title} bullet={index + 1}>
            <Text size="sm" c="dimmed" mt={4}>
              {step.description}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </Paper>
  );
}
