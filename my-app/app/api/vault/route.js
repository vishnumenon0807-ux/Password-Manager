import { createEntry, listEntries, validateEntry } from "@/lib/vault";
import { badRequest, getUserId, json, readJson, serverError, unauthorized } from "@/lib/session";

// GET /api/vault  -> every entry for the signed-in user, without passwords
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const passwords = await listEntries(userId);
    return json({ success: true, passwords });
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/vault  -> save a new entry (password and notes are encrypted)
export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const body = await readJson(request);
    if (!body) return badRequest("Send the entry as JSON.");

    const { values, error } = validateEntry(body);
    if (error) return badRequest(error);

    const id = await createEntry(userId, values);
    return json({ success: true, message: "Password saved.", id }, 201);
  } catch (err) {
    return serverError(err);
  }
}
