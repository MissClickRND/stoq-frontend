import { useState } from "react";
import { AuthContent } from "@/widgets/auth-layout";
import { registrationCopy } from "../model/data";
import { RegistrationForm } from "./components/RegistrationForm";
import { RegistrationPending } from "./components/RegistrationPending";
import type { MockRestaurant } from "@/shared/api/auth-mock/type";

export function RegisterPage() {
  const [restaurant, setRestaurant] = useState<MockRestaurant | null>(null);
  return (
    <AuthContent
      title={
        restaurant ? registrationCopy.pendingTitle : registrationCopy.title
      }
      description={
        restaurant
          ? registrationCopy.pendingDescription
          : registrationCopy.description
      }
    >
      {restaurant ? (
        <RegistrationPending restaurantName={restaurant.name} />
      ) : (
        <RegistrationForm onSubmit={setRestaurant} />
      )}
    </AuthContent>
  );
}
