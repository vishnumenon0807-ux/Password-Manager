import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import { getCurrentUser } from "@/lib/session";

// Every page inside app/(app) needs a signed-in user. The group folder name
// in brackets doesn't show up in the URL, so /dashboard stays /dashboard.
export default async function ProtectedLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-black text-white">
      <AppNav user={{ name: user.name, email: user.email }} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
