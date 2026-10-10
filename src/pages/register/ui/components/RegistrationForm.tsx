import { Alert, Button, Select, Stack, Text, TextInput } from "@mantine/core";
import { IconBuildingStore, IconMail, IconUser } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getMockRestaurants,
  submitMockEmployeeRegistration,
} from "@/shared/api/auth-mock";
import type { MockRestaurant } from "@/shared/api/auth-mock/type";
import { isValidEmail } from "@/shared/lib/auth-validation";
import { employeeInitialValues, registrationCopy } from "../../model/data";
import classes from "@/shared/ui/auth-fields/AuthFields.module.css";

export function RegistrationForm({
  onSubmit,
}: {
  onSubmit: (restaurant: MockRestaurant) => void;
}) {
  const [restaurants] = useState(getMockRestaurants);
  const [params] = useSearchParams();
  const [values, setValues] = useState(() => ({
    ...employeeInitialValues,
    restaurantId: restaurants.some(
      (restaurant) => restaurant.id === params.get("restaurantId"),
    )
      ? params.get("restaurantId")!
      : "",
  }));
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof values, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const updateValue = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = {
      name:
        values.name.trim().split(/\s+/).length >= 2
          ? undefined
          : registrationCopy.nameError,
      email: isValidEmail(values.email)
        ? undefined
        : registrationCopy.emailError,
      restaurantId: restaurants.some(
        (restaurant) => restaurant.id === values.restaurantId,
      )
        ? undefined
        : registrationCopy.restaurantError,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSubmitting(true);
    setRequestError(null);
    try {
      const result = await submitMockEmployeeRegistration({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        invitationId: params.get("invitation") ?? undefined,
      });
      onSubmit(result.restaurant);
    } catch {
      setRequestError(registrationCopy.requestError);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {requestError && <Alert color="red">{requestError}</Alert>}
        <TextInput
          size="lg"
          placeholder={registrationCopy.name}
          aria-label={registrationCopy.name}
          autoComplete="name"
          leftSection={<IconUser size={22} />}
          classNames={{ input: classes.input, section: classes.section }}
          value={values.name}
          onChange={(event) => updateValue("name", event.currentTarget.value)}
          error={errors.name}
        />
        <TextInput
          size="lg"
          placeholder={registrationCopy.email}
          aria-label={registrationCopy.email}
          type="email"
          autoComplete="email"
          leftSection={<IconMail size={22} />}
          classNames={{ input: classes.input, section: classes.section }}
          value={values.email}
          onChange={(event) => updateValue("email", event.currentTarget.value)}
          error={errors.email}
        />
        <Select
          size="lg"
          placeholder={registrationCopy.restaurant}
          aria-label={registrationCopy.restaurant}
          description={registrationCopy.restaurantDescription}
          inputWrapperOrder={["label", "input", "description", "error"]}
          searchable
          nothingFoundMessage="Заведение не найдено"
          leftSection={<IconBuildingStore size={22} />}
          data={restaurants.map((restaurant) => ({
            value: restaurant.id,
            label: restaurant.name + " — " + restaurant.city,
          }))}
          value={values.restaurantId || null}
          onChange={(value) => updateValue("restaurantId", value ?? "")}
          error={errors.restaurantId}
          classNames={{
            input: classes.input,
            section: classes.section,
            option: classes.option,
          }}
          styles={{
            dropdown: {
              backgroundColor: "var(--mantine-color-white)",
              color: "var(--mantine-color-secondary-9)",
              borderColor: "var(--mantine-color-gray-3)",
            },
            description: { color: "var(--mantine-color-gray-6)" },
          }}
        />
        <Button
          className={classes.submit}
          type="submit"
          size="lg"
          fullWidth
          mt="sm"
          loading={submitting}
        >
          {registrationCopy.submit}
        </Button>
        <Text className={classes.footer} size="sm" ta="center">
          {registrationCopy.footer}
        </Text>
      </Stack>
    </form>
  );
}
