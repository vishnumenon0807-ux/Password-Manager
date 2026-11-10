import Link from "next/link";
import { getStats } from "@/lib/vault";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Dashboard | PassVault" };

const CARDS = [
  {
    href: "/vault",
    icon: "🔐",
    title: "Password Vault",
    text: "View and manage all your saved passwords securely.",
    hover: "hover:border-cyan-400",
  },
  {
    href: "/vault/new",
    icon: "➕",
    title: "Add Password",
    text: "Save a new website, username and password.",
    hover: "hover:border-green-400",
  },
  {
    href: "/favorites",
    icon: "⭐",
    title: "Favourites",
    text: "Quickly access your most-used accounts.",
    hover: "hover:border-yellow-400",
  },
  {
    href: "/weak-passwords",
    icon: "⚠️",
    title: "Weak Passwords",
    text: "Find passwords that should be changed.",
    hover: "hover:border-red-400",
  },
  {
    href: "/statistics",
    icon: "📊",
    title: "Statistics",
    text: "Track total passwords and security score.",
    hover: "hover:border-purple-400",
  },
  {
    href: "/settings",
    icon: "⚙️",
    title: "Settings",
    text: "Update profile, security and preferences.",
    hover: "hover:border-pink-400",
  },
];

export default async function Dashboard() {
  const user = await requireUser();
  const stats = await getStats(user.id);
  const firstName = user.name?.split(" ")[0];

  return (
    <>
      {/* Welcome */}

      <section className="py-4">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Your passwords are encrypted. Manage everything from one place.
        </p>
      </section>

      {/* Stats */}

      <section className="py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-cyan-500 p-8 text-center">
            <h2 className="text-4xl font-bold">{stats.total}</h2>
            <p className="mt-2">Saved Passwords</p>
          </div>

          <div className="rounded-3xl bg-green-500 p-8 text-center">
            <h2 className="text-4xl font-bold">
              {stats.securityScore === null ? "–" : `${stats.securityScore}%`}
            </h2>
            <p className="mt-2">Security Score</p>
          </div>

          <div className="rounded-3xl bg-purple-500 p-8 text-center">
            <h2 className="text-4xl font-bold">{stats.weak.length}</h2>
            <p className="mt-2">Weak Passwords</p>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}

      <section className="pb-8">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((card) => (
            <Link key={card.href} href={card.href}>
              <div
                className={`h-full cursor-pointer rounded-3xl border border-transparent bg-white/10 p-8 backdrop-blur-lg transition hover:scale-105 ${card.hover}`}
              >
                <div className="mb-6 text-6xl">{card.icon}</div>
                <h2 className="mb-3 text-2xl font-bold">{card.title}</h2>
                <p className="text-gray-300">{card.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
