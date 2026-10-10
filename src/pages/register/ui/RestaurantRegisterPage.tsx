import { useState } from "react";
import type { MockRestaurant } from "@/shared/api/auth-mock/type";
import { AuthContent } from "@/widgets/auth-layout";
import { restaurantRegistrationCopy as copy } from "../model/data";
import { RestaurantRegistrationForm } from "./components/RestaurantRegistrationForm";
import { RestaurantRegistrationSuccess } from "./components/RestaurantRegistrationSuccess";

export function RestaurantRegisterPage() {
  const [restaurant, setRestaurant] = useState<MockRestaurant | null>(null);
  return (
    <AuthContent
      title={restaurant ? copy.successTitle : copy.title}
      description={restaurant ? copy.successDescription : copy.description}
    >
      {restaurant ? (
        <RestaurantRegistrationSuccess restaurantName={restaurant.name} />
      ) : (
        <RestaurantRegistrationForm onSubmit={setRestaurant} />
      )}
    </AuthContent>
  );
}
