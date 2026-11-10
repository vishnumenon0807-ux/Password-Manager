"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PasswordCard from "@/components/PasswordCard";
import { CATEGORIES } from "@/lib/categories";

export default function VaultList({ favouritesOnly = false }) {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [onlyFavourites, setOnlyFavourites] = useState(favouritesOnly);
  const [sort, setSort] = useState("name");

  useEffect(() => {
    async function loadPasswords() {
      try {
        const response = await fetch("/api/vault", { cache: "no-store" });
        const data = await response.json();
        if (data.success) setPasswords(data.passwords);
        else setError(data.message);
      } catch {
        setError("Couldn't reach the server.");
      }
      setLoading(false);
    }
    loadPasswords();
  }, []);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = passwords.filter((item) => {
      if (onlyFavourites && !item.favorite) return false;
      if (category !== "All" && item.category !== category) return false;
      if (!term) return true;
      return [item.website, item.username, item.url, item.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });

    if (sort === "recent") {
      list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (sort === "weakest") {
      list.sort((a, b) => (a.strength?.score ?? -1) - (b.strength?.score ?? -1));
    }
    return list;
  }, [passwords, search, category, onlyFavourites, sort]);

  const usedCategories = CATEGORIES.filter((c) => passwords.some((p) => p.category === c));

  function updateItem(updated) {
    setPasswords((list) => list.map((p) => (p.id === updated.id ? updated : p)));
  }

  function removeItem(id) {
    // Reuse counts change when an entry goes, so reload them from the server.
    setPasswords((list) => list.filter((p) => p.id !== id));
    fetch("/api/vault", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => data.success && setPasswords(data.passwords))
      .catch(() => {});
  }

  if (loading) return <p className="text-slate-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  if (passwords.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-800/60 p-12 text-center">
        <h2 className="text-3xl font-bold">No passwords saved</h2>
        <p className="mt-3 text-slate-400">Add your first one and it will show up here.</p>
        <Link href="/vault/new" className="btn-primary mt-6 inline-block">
          Add password
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by website, username or URL"
          className="field md:flex-1"
          aria-label="Search passwords"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="field md:w-48"
          aria-label="Sort"
        >
          <option value="name">Name A to Z</option>
          <option value="recent">Recently changed</option>
          <option value="weakest">Weakest first</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["All", ...usedCategories].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              category === c ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {c}
          </button>
        ))}
        {!favouritesOnly && (
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={onlyFavourites}
              onChange={(e) => setOnlyFavourites(e.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            Favourites only
          </label>
        )}
      </div>

      <p className="text-sm text-slate-500">
        Showing {shown.length} of {favouritesOnly ? passwords.filter((p) => p.favorite).length : passwords.length}
      </p>

      {shown.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/60 p-8 text-center text-slate-300">
          {favouritesOnly && !passwords.some((p) => p.favorite)
            ? "No favourites yet. Click the star on any entry in your vault to add it here."
            : "Nothing matches that search."}
        </div>
      ) : (
        <div className="grid gap-4">
          {shown.map((item) => (
            <PasswordCard key={item.id} item={item} onChange={updateItem} onDelete={removeItem} />
          ))}
        </div>
      )}
    </div>
  );
}
