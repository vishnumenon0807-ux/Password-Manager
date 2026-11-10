"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vault", label: "Vault" },
  { href: "/favorites", label: "Favourites" },
  { href: "/weak-passwords", label: "Weak passwords" },
  { href: "/statistics", label: "Statistics" },
  { href: "/settings", label: "Settings" },
];

export default function AppNav({ user }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link href="/dashboard" className="text-2xl font-bold text-cyan-400">
          🔐 PassVault
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 md:inline">{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-8">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-cyan-500/15 text-cyan-300" : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
