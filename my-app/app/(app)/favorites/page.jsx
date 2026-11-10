import VaultList from "@/components/VaultList";

export const metadata = { title: "Favourites | PassVault" };

export default function Favourites() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">⭐ Favourites</h1>
        <p className="mt-2 text-slate-400">The accounts you starred, for quick access.</p>
      </div>
      <VaultList favouritesOnly />
    </>
  );
}
