"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PasswordGenerator from "@/components/PasswordGenerator";
import StrengthMeter from "@/components/StrengthMeter";
import { CATEGORIES } from "@/lib/categories";

const EMPTY = {
  website: "",
  url: "",
  username: "",
  password: "",
  notes: "",
  category: "Other",
  favorite: false,
};

// Used for both "Add password" (no id) and "Edit password" (id given).
export default function PasswordForm({ id }) {
  const router = useRouter();
  const editing = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    if (!editing) return;
    async function load() {
      try {
        const response = await fetch(`/api/vault/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        const { website, url, username, password, notes, category, favorite } = data.entry;
        setForm({ website, url: url ?? "", username, password, notes, category, favorite });
      } catch (err) {
        setError(err.message || "Couldn't load this entry.");
      }
      setLoading(false);
    }
    load();
  }, [editing, id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(editing ? `/api/vault/${id}` : "/api/vault", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setSaving(false);
        return;
      }

      router.push("/vault");
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-3xl bg-white/5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Website or app</span>
          <input
            className="field"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="GitHub"
            required
            autoFocus={!editing}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-slate-300">URL (optional)</span>
          <input
            className="field"
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="github.com/login"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Username or email</span>
        <input
          className="field"
          value={form.username}
          onChange={(e) => set("username", e.target.value)}
          placeholder="you@example.com"
          autoComplete="off"
        />
      </label>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-slate-300">
          Password
        </label>
        <div className="flex gap-2">
          <input
            id="password"
            className="field font-mono"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
            required
          />
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="btn-ghost shrink-0">
            {showPassword ? "Hide" : "Show"}
          </button>
          <button type="button" onClick={() => setShowGenerator((s) => !s)} className="btn-ghost shrink-0">
            {showGenerator ? "Close" : "Generate"}
          </button>
        </div>
        <StrengthMeter password={form.password} />
      </div>

      {showGenerator && (
        <PasswordGenerator
          onUse={(value) => {
            set("password", value);
            setShowPassword(true);
            setShowGenerator(false);
          }}
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Category</span>
          <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-3 self-end pb-3 text-slate-300">
          <input
            type="checkbox"
            checked={form.favorite}
            onChange={(e) => set("favorite", e.target.checked)}
            className="h-5 w-5 accent-cyan-500"
          />
          Add to favourites
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Secure notes (optional, encrypted)</span>
        <textarea
          className="field min-h-28"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Recovery codes, security questions, PIN..."
        />
      </label>

      {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : editing ? "Save changes" : "Save password"}
        </button>
        <Link href="/vault" className="rounded-xl px-5 py-3 text-slate-300 hover:text-white">
          Cancel
        </Link>
      </div>
    </form>
  );
}
