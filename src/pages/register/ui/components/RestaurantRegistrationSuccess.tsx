import { Button, Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { restaurantRegistrationCopy as copy } from "../../model/data";
import classes from "@/shared/ui/auth-fields/AuthFields.module.css";

export function RestaurantRegistrationSuccess({
  restaurantName,
}: {
  restaurantName: string;
}) {
  const navigate = useNavigate();
  return (
    <Stack gap="lg" ta="center" role="status">
      <Center>
        <ThemeIcon size={72} radius="xl" color="green" variant="light">
          <IconCheck size={36} />
        </ThemeIcon>
      </Center>
      <Text c="secondary.9" fw={700}>
        {restaurantName}
      </Text>
      <Text className={classes.footer}>{copy.successMessage}</Text>
      <Button
        className={classes.submit}
        size="lg"
        onClick={() => navigate("/dashboard", { replace: true })}
      >
        {copy.continue}
      </Button>
    </Stack>
  );
}
