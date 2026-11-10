import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { googleEnabled } from "@/lib/auth";
import { getUserId } from "@/lib/session";

export const metadata = { title: "Login | PassVault" };

export default async function LoginPage({ searchParams }) {
  if (await getUserId()) redirect("/dashboard");

  // NextAuth sends errors back here as ?error=..., e.g. after a failed
  // Google sign-in. searchParams is a Promise in Next.js 16.
  const { error } = await searchParams;

  return <AuthForm mode="login" googleEnabled={googleEnabled} initialError={error} />;
}
