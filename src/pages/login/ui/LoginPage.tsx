import { AuthContent } from "@/widgets/auth-layout";
import { loginCopy } from "../model/config";
import { LoginForm } from "./components/LoginForm";
import { DemoLoginPanel } from "@/features/test-panel";

export function LoginPage() {
  return (
    <AuthContent title={loginCopy.title} description={loginCopy.description}>
      <LoginForm />
      <DemoLoginPanel />
    </AuthContent>
  );
}
