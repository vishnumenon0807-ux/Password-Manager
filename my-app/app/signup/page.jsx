import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { googleEnabled } from "@/lib/auth";
import { getUserId } from "@/lib/session";

export const metadata = { title: "Sign up | PassVault" };

export default async function SignupPage() {
  if (await getUserId()) redirect("/dashboard");

  return <AuthForm mode="signup" googleEnabled={googleEnabled} />;
}
