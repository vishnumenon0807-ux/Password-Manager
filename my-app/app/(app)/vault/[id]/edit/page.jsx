import { notFound } from "next/navigation";
import PasswordForm from "@/components/PasswordForm";
import { parseId } from "@/lib/vault";

export const metadata = { title: "Edit password | PassVault" };

// In Next.js 16, params is a Promise and has to be awaited.
export default async function EditPassword({ params }) {
  const id = parseId((await params).id);
  if (!id) notFound();

  return (
    <>
      <h1 className="mb-8 text-4xl font-bold">Edit password</h1>
      <PasswordForm id={id} />
    </>
  );
}
