import Link from "next/link";
import VaultList from "@/components/VaultList";

export const metadata = { title: "Vault | PassVault" };

export default function Vault() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Password Vault</h1>
          <p className="mt-2 text-slate-400">
            Passwords stay encrypted until you click Show or Copy on an entry.
          </p>
        </div>
        <Link href="/vault/new" className="btn-primary">
          Add password
        </Link>
      </div>
      <VaultList />
    </>
  );
}
