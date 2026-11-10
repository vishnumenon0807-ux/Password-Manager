import Link from "next/link";
import { StrengthBadge } from "@/components/StrengthMeter";
import { getStats } from "@/lib/vault";
import { requireUserId } from "@/lib/session";

export const metadata = { title: "Weak passwords | PassVault" };

function Row({ item, detail }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-800/70 p-5">
      <div className="min-w-0">
        <h3 className="truncate text-lg font-bold">{item.website}</h3>
        <p className="truncate text-slate-400">{item.username || "No username"}</p>
        {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
      </div>
      <div className="flex items-center gap-3">
        <StrengthBadge strength={item.strength} />
        <Link href={`/vault/${item.id}/edit`} className="btn-ghost">
          Change
        </Link>
      </div>
    </div>
  );
}

function Section({ title, description, items, detail }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">
          {title} <span className="text-slate-500">({items.length})</span>
        </h2>
        <p className="text-slate-400">{description}</p>
      </div>
      {items.map((item) => (
        <Row key={item.id} item={item} detail={detail(item)} />
      ))}
    </section>
  );
}

export default async function WeakPasswords() {
  const userId = await requireUserId();
  const stats = await getStats(userId);
  const nothingToFix = stats.weak.length + stats.reused.length + stats.old.length === 0;

  return (
    <div className="space-y-10">
      <div className="rounded-3xl bg-slate-800/60 p-8">
        <div className="mb-4 text-5xl">⚠️</div>
        <h1 className="text-4xl font-bold">Weak passwords</h1>
        <p className="mt-3 text-slate-300">
          Passwords that are easy to guess, used on more than one account, or haven&apos;t been
          changed in a long time.
        </p>
      </div>

      {stats.total === 0 ? (
        <div className="rounded-3xl bg-slate-800/60 p-8 text-center text-slate-300">
          Save some passwords first and they&apos;ll be checked here.
        </div>
      ) : nothingToFix ? (
        <div className="rounded-3xl bg-green-700 p-8 text-center">
          <h2 className="text-2xl font-bold">🎉 No weak passwords found</h2>
        </div>
      ) : (
        <>
          <Section
            title="Weak"
            description="Rated Weak or Very weak. Replace these with generated passwords."
            items={stats.weak}
            detail={(item) => item.strength?.hint}
          />
          <Section
            title="Reused"
            description="The same password is saved for more than one account. If one site leaks it, the others are exposed too."
            items={stats.reused}
            detail={(item) =>
              `Same password as ${item.reusedWith} other ${item.reusedWith === 1 ? "entry" : "entries"}`
            }
          />
          <Section
            title="Not changed recently"
            description={`Last changed more than ${stats.oldAfterDays} days ago.`}
            items={stats.old}
            detail={(item) => `Last changed ${new Date(item.updatedAt).toLocaleDateString("en-AU")}`}
          />
        </>
      )}
    </div>
  );
}
