import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { checkStrength } from "@/lib/strength";
import { badRequest, json, readJson, serverError } from "@/lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await readJson(request);
    if (!body) return badRequest("Send the form as JSON.");

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name) return badRequest("Enter your name.");
    if (!EMAIL_PATTERN.test(email)) return badRequest("Enter a valid email address.");
    if (password.length < 8) return badRequest("Use at least 8 characters for your password.");
    if (password.length > 72) {
      // bcrypt only looks at the first 72 bytes.
      return badRequest("Use 72 characters or fewer for your password.");
    }

    // This password protects every other password in the vault, so it
    // has to clear the same bar as a "Fair" entry.
    const strength = checkStrength(password);
    if (strength.score < 2) {
      return badRequest(`That password is ${strength.label.toLowerCase()}. ${strength.feedback[0] ?? ""}`.trim());
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [name, email, passwordHash]
    );

    if (result.rowCount === 0) {
      return json(
        { success: false, message: "An account with this email already exists. Log in instead." },
        409
      );
    }

    return json({ success: true, message: "Account created." }, 201);
  } catch (err) {
    return serverError(err);
  }
}
