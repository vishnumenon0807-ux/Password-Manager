import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

// Returns the signed-in user's id, or null.
//
// The JWT alone would keep working until it expires even after the account
// is deleted, so this also checks the user row still exists.
export async function getUserId() {
  const session = await getServerSession(authOptions);
  const id = Number(session?.user?.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const { rowCount } = await query("SELECT 1 FROM users WHERE id = $1", [id]);
  return rowCount === 1 ? id : null;
}

export async function getCurrentUser() {
  const id = await getUserId();
  if (!id) return null;

  const { rows } = await query(
    `SELECT id, name, email, image, created_at,
            password_hash IS NOT NULL AS has_password
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

// For server pages. Layouts and pages render in parallel in the App
// Router, so the redirect in app/(app)/layout.jsx doesn't stop a page from
// running. Every protected page calls one of these itself.
export async function requireUserId() {
  const id = await getUserId();
  if (!id) redirect("/login");
  return id;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function json(body, status = 200) {
  return NextResponse.json(body, { status });
}

export function unauthorized() {
  return json({ success: false, message: "Please log in again." }, 401);
}

export function badRequest(message) {
  return json({ success: false, message }, 400);
}

export function serverError(err) {
  console.error(err);
  return json({ success: false, message: "Server error. Check the terminal for details." }, 500);
}

// Mutating API routes only accept JSON. A cross-site HTML form cannot send
// application/json without a CORS preflight, which this app never allows,
// so this (together with the SameSite=Lax session cookie) blocks CSRF.
export async function readJson(request) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}
