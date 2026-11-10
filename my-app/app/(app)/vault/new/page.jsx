import PasswordForm from "@/components/PasswordForm";

export const metadata = { title: "Add password | PassVault" };

export default function NewPassword() {
  return (
    <>
      <h1 className="mb-8 text-4xl font-bold">Add password</h1>
      <PasswordForm />
    </>
  );
}
