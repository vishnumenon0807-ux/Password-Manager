import { query } from "@/lib/db";
import { badRequest, getUserId, json, readJson, serverError, unauthorized } from "@/lib/session";

// PATCH /api/account  { name }  -> change display name
export async function PATCH(request) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const body = await readJson(request);
    const name = String(body?.name ?? "").trim();
    if (!name) return badRequest("Enter your name.");
    if (name.length > 100) return badRequest("Name is too long.");

    await query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
    return json({ success: true, message: "Name updated." });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/account  { confirmEmail }  -> delete the account and every
// saved password (ON DELETE CASCADE). The user has to type their email
// so this can't be triggered by a stray click.
export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const body = await readJson(request);
    const confirmEmail = String(body?.confirmEmail ?? "").trim().toLowerCase();

    const result = await query("DELETE FROM users WHERE id = $1 AND email = $2", [
      userId,
      confirmEmail,
    ]);
    if (result.rowCount !== 1) {
      return badRequest("Type your account email exactly to confirm.");
    }

    return json({ success: true, message: "Account deleted." });
  } catch (err) {
    return serverError(err);
  }
}
