import { AuthContent } from "@/widgets/auth-layout";
import { registrationCopy } from "../model/config";
import { RegistrationForm } from "./components/RegistrationForm/RegistrationForm";
export function RegisterPage() {
  return (
    <AuthContent
      title={registrationCopy.title}
      description={registrationCopy.description}
      layout="wide"
    >
      <RegistrationForm />
    </AuthContent>
  );
}
