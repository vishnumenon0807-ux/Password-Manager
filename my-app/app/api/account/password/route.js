import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { checkStrength } from "@/lib/strength";
import { badRequest, getUserId, json, readJson, serverError, unauthorized } from "@/lib/session";

// POST /api/account/password  { currentPassword, newPassword }
// Changes the login password. Accounts created with Google have no
// password yet, so for them this sets one and currentPassword is ignored.
export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const body = await readJson(request);
    if (!body) return badRequest("Send the form as JSON.");

    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    const existingHash = rows[0]?.password_hash;

    if (existingHash && !(await bcrypt.compare(currentPassword, existingHash))) {
      return badRequest("Your current password is wrong.");
    }

    if (newPassword.length < 8) return badRequest("Use at least 8 characters.");
    if (newPassword.length > 72) return badRequest("Use 72 characters or fewer.");

    const strength = checkStrength(newPassword);
    if (strength.score < 2) {
      return badRequest(`That password is ${strength.label.toLowerCase()}. ${strength.feedback[0] ?? ""}`.trim());
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, userId]);

    return json({
      success: true,
      message: existingHash ? "Password changed." : "Password set. You can now log in with your email too.",
    });
  } catch (err) {
    return serverError(err);
  }
}
