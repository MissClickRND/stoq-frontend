import { AuthContent } from "@/widgets/auth-layout";
import { loginCopy } from "../model/data";
import { LoginForm } from "./components/LoginForm";

export function LoginPage() {
  return (
    <AuthContent title={loginCopy.title} description={loginCopy.description}>
      <LoginForm />
    </AuthContent>
  );
}
