import { STRENGTH_COLOURS } from "@/lib/strength-styles";
import { STRENGTH_LABELS } from "@/lib/strength";
import { getStats } from "@/lib/vault";
import { requireUserId } from "@/lib/session";

export const metadata = { title: "Statistics | PassVault" };

function Stat({ value, label, className }) {
  return (
    <div className={`rounded-3xl p-6 text-center ${className}`}>
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-2">{label}</p>
    </div>
  );
}

function Bar({ label, count, total, colour }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div className={`h-3 rounded-full ${colour}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function Statistics() {
  const userId = await requireUserId();
  const stats = await getStats(userId);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">📊 Statistics</h1>
        <p className="mt-2 text-slate-400">How healthy your saved passwords are.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat value={stats.total} label="Saved passwords" className="bg-cyan-500" />
        <Stat
          value={stats.securityScore === null ? "–" : `${stats.securityScore}%`}
          label="Security score"
          className="bg-green-600"
        />
        <Stat value={stats.favorites} label="Favourites" className="bg-purple-500" />
        <Stat value={stats.weak.length} label="Weak passwords" className="bg-red-500/80" />
        <Stat value={stats.reused.length} label="Reused passwords" className="bg-orange-500/80" />
        <Stat
          value={stats.old.length}
          label={`Unchanged for ${stats.oldAfterDays}+ days`}
          className="bg-slate-700"
        />
      </div>

      <p className="text-sm text-slate-400">
        Security score is the share of your passwords that are rated Strong or Very strong and
        aren&apos;t used on any other account ({stats.healthy} of{" "}
        {stats.total - stats.decryptFailed}).
      </p>

      {stats.total > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-3xl bg-white/5 p-6">
            <h2 className="text-xl font-bold">Strength</h2>
            {[4, 3, 2, 1, 0].map((score) => (
              <Bar
                key={score}
                label={STRENGTH_LABELS[score]}
                count={stats.byStrength[score]}
                total={stats.total}
                colour={STRENGTH_COLOURS[score]}
              />
            ))}
          </section>

          <section className="space-y-4 rounded-3xl bg-white/5 p-6">
            <h2 className="text-xl font-bold">Categories</h2>
            {stats.byCategory.map((c) => (
              <Bar key={c.name} label={c.name} count={c.count} total={stats.total} colour="bg-cyan-500" />
            ))}
          </section>
        </div>
      )}

      {stats.decryptFailed > 0 && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {stats.decryptFailed} saved {stats.decryptFailed === 1 ? "entry" : "entries"} couldn&apos;t
          be decrypted. ENCRYPTION_KEY may have changed since they were saved.
        </p>
      )}
    </div>
  );
}
