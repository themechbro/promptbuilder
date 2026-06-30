import LoginClient from "./LoginClient";
import { buildMetadata } from "@/app/lib/seo";

export const metadata = buildMetadata({
  title: "Login",
  description:
    "Sign in to Prompt Builder to access your saved components, API keys, and advanced workspace.",
  path: "/auth/login",
  socialTitle: "Login | Prompt Builder",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginClient />;
}
