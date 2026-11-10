import SettingsForms from "@/components/SettingsForms";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Settings | PassVault" };

export default async function Settings() {
  const user = await requireUser();

  return (
    <>
      <h1 className="mb-8 text-4xl font-bold">⚙️ Settings</h1>
      <SettingsForms
        user={{
          name: user.name ?? "",
          email: user.email,
          hasPassword: user.has_password,
          memberSince: new Date(user.created_at).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }}
      />
    </>
  );
}
