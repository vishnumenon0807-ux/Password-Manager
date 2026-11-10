"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import StrengthMeter from "@/components/StrengthMeter";

async function send(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { ok: response.ok, message: data.message };
}

function Message({ result }) {
  if (!result) return null;
  return <p className={`text-sm ${result.ok ? "text-green-400" : "text-red-400"}`}>{result.message}</p>;
}

export default function SettingsForms({ user }) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [profileResult, setProfileResult] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordResult, setPasswordResult] = useState(null);

  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteResult, setDeleteResult] = useState(null);
  const [busy, setBusy] = useState("");

  async function saveProfile(e) {
    e.preventDefault();
    setBusy("profile");
    const result = await send("/api/account", "PATCH", { name });
    setProfileResult(result);
    setBusy("");
    if (result.ok) router.refresh();
  }

  async function changePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordResult({ ok: false, message: "The new passwords don't match." });
      return;
    }
    setBusy("password");
    const result = await send("/api/account/password", "POST", { currentPassword, newPassword });
    setPasswordResult(result);
    setBusy("");
    if (result.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    }
  }

  async function deleteAccount(e) {
    e.preventDefault();
    if (!confirm("Delete your account and every saved password? This can't be undone.")) return;
    setBusy("delete");
    const result = await send("/api/account", "DELETE", { confirmEmail });
    setBusy("");
    if (result.ok) signOut({ callbackUrl: "/" });
    else setDeleteResult(result);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <form onSubmit={saveProfile} className="space-y-4 rounded-3xl bg-white/5 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Profile</h2>
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className="space-y-1 text-sm text-slate-400">
          <p>Email: {user.email}</p>
          <p>Member since {user.memberSince}</p>
        </div>
        <Message result={profileResult} />
        <button type="submit" disabled={busy === "profile"} className="btn-primary">
          Save name
        </button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded-3xl bg-white/5 p-6 sm:p-8">
        <h2 className="text-2xl font-bold">{user.hasPassword ? "Change password" : "Set a password"}</h2>
        {!user.hasPassword && (
          <p className="text-sm text-slate-400">
            You signed up with Google. Set a password if you also want to log in with your email.
          </p>
        )}
        {user.hasPassword && (
          <label className="block space-y-2">
            <span className="text-sm text-slate-300">Current password</span>
            <input
              className="field"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        )}
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">New password</span>
          <input
            className="field"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <StrengthMeter password={newPassword} />
        <label className="block space-y-2">
          <span className="text-sm text-slate-300">Confirm new password</span>
          <input
            className="field"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <Message result={passwordResult} />
        <button type="submit" disabled={busy === "password"} className="btn-primary">
          {user.hasPassword ? "Change password" : "Set password"}
        </button>
      </form>

      <form onSubmit={deleteAccount} className="space-y-4 rounded-3xl border border-red-500/40 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-red-300">Delete account</h2>
        <p className="text-sm text-slate-400">
          This permanently deletes your account and every password in your vault. Type{" "}
          <span className="font-semibold text-slate-200">{user.email}</span> to confirm.
        </p>
        <input
          className="field"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={user.email}
          aria-label="Type your email to confirm"
        />
        <Message result={deleteResult} />
        <button
          type="submit"
          disabled={busy === "delete" || confirmEmail.trim().toLowerCase() !== user.email}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete my account
        </button>
      </form>
    </div>
  );
}
