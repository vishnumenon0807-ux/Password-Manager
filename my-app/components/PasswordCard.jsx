"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { StrengthBadge } from "@/components/StrengthMeter";

// How long a revealed password stays on screen.
const HIDE_AFTER_MS = 20_000;

async function fetchSecret(id) {
  const response = await fetch(`/api/vault/${id}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "Couldn't load that password.");
  return data.entry;
}

export default function PasswordCard({ item, onChange, onDelete }) {
  const [secret, setSecret] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  function hide() {
    clearTimeout(hideTimer.current);
    setSecret(null);
  }

  async function reveal() {
    setError("");
    try {
      const entry = await fetchSecret(item.id);
      setSecret(entry);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setSecret(null), HIDE_AFTER_MS);
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyPassword() {
    if (secret) return secret.password;
    const entry = await fetchSecret(item.id);
    return entry.password;
  }

  async function toggleFavourite() {
    setBusy(true);
    setError("");
    const favorite = !item.favorite;
    const response = await fetch(`/api/vault/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite }),
    });
    setBusy(false);
    if (response.ok) onChange({ ...item, favorite });
    else setError((await response.json()).message);
  }

  async function remove() {
    if (!confirm(`Delete the saved password for ${item.website}? This can't be undone.`)) return;
    setBusy(true);
    const response = await fetch(`/api/vault/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (response.ok) onDelete(item.id);
    else setError((await response.json()).message);
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-white/5 p-4 transition sm:p-5 hover:border-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-bold">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">
                  {item.website}
                </a>
              ) : (
                item.website
              )}
            </h2>
            <button
              type="button"
              onClick={toggleFavourite}
              disabled={busy}
              aria-label={item.favorite ? "Remove from favourites" : "Add to favourites"}
              title={item.favorite ? "Remove from favourites" : "Add to favourites"}
              className={`text-xl leading-none transition ${item.favorite ? "text-yellow-400" : "text-slate-600 hover:text-yellow-300"}`}
            >
              {item.favorite ? "★" : "☆"}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2 text-slate-400">
            <span className="truncate">{item.username || "No username"}</span>
            {item.username && (
              <CopyButton
                getText={() => item.username}
                label="Copy"
                className="text-xs text-cyan-400 hover:text-cyan-300"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{item.category}</span>
          <StrengthBadge strength={item.strength} />
          {item.reusedWith > 0 && (
            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs text-orange-300">
              Reused on {item.reusedWith} other {item.reusedWith === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className="w-full min-w-0 truncate rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm sm:w-auto sm:flex-1">
          {secret ? secret.password : "••••••••••••"}
        </code>
        <button type="button" onClick={secret ? hide : reveal} className="btn-ghost">
          {secret ? "Hide" : "Show"}
        </button>
        <CopyButton
          getText={copyPassword}
          label={
            <>
              <span className="sm:hidden">Copy</span>
              <span className="hidden sm:inline">Copy password</span>
            </>
          }
        />
        <Link href={`/vault/${item.id}/edit`} className="btn-ghost">
          Edit
        </Link>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>

      {secret && item.hasNotes && (
        <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-300">
          {secret.notes}
        </p>
      )}
      {!secret && item.hasNotes && (
        <p className="mt-3 text-xs text-slate-500">Has encrypted notes. Click Show to read them.</p>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </article>
  );
}
