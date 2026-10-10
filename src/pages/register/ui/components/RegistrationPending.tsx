import { Center, Loader, Stack, Text } from "@mantine/core";

import { registrationCopy } from "../../model/data";
import classes from "@/shared/ui/auth-fields/AuthFields.module.css";

export function RegistrationPending({
  restaurantName,
}: {
  restaurantName: string;
}) {
  return (
    <Stack gap="lg" ta="center" role="status">
      <Center>
        <Loader type="dots" color="black" size="xl" />
      </Center>
      <Text className={classes.footer}>{registrationCopy.pendingMessage}</Text>
      <Text c="secondary.9" fw={600}>
        {restaurantName}
      </Text>
    </Stack>
  );
}
