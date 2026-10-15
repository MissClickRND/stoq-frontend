import { AuthContent } from "@/widgets/auth-layout";
import { restaurantRegistrationCopy as copy } from "../model/config";
import { RestaurantRegistrationForm } from "./components/RestaurantRegistrationForm";
export function RestaurantRegisterPage() {
  return (
    <AuthContent title={copy.title} description={copy.description} layout="wide">
      <RestaurantRegistrationForm />
    </AuthContent>
  );
}
