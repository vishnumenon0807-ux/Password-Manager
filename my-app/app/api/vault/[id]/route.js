import { DecryptError, deleteEntry, getEntry, parseId, updateEntry, validateEntry } from "@/lib/vault";
import { badRequest, getUserId, json, readJson, serverError, unauthorized } from "@/lib/session";

function notFound() {
  return json({ success: false, message: "That entry doesn't exist." }, 404);
}

// GET /api/vault/:id  -> one entry with its password and notes decrypted.
// Called only when the user reveals, copies or edits that entry.
export async function GET(request, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const id = parseId((await params).id);
    if (!id) return notFound();

    const entry = await getEntry(userId, id);
    if (!entry) return notFound();

    return json({ success: true, entry });
  } catch (err) {
    if (err instanceof DecryptError) {
      return json({ success: false, message: err.message }, 500);
    }
    return serverError(err);
  }
}

// PATCH /api/vault/:id  -> change any of the fields sent
export async function PATCH(request, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const id = parseId((await params).id);
    if (!id) return notFound();

    const body = await readJson(request);
    if (!body) return badRequest("Send the changes as JSON.");

    const { values, error } = validateEntry(body, { partial: true });
    if (error) return badRequest(error);

    const updated = await updateEntry(userId, id, values);
    if (!updated) return notFound();

    return json({ success: true, message: "Saved." });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/vault/:id
export async function DELETE(request, { params }) {
  try {
    const userId = await getUserId();
    if (!userId) return unauthorized();

    const id = parseId((await params).id);
    if (!id) return notFound();

    const deleted = await deleteEntry(userId, id);
    if (!deleted) return notFound();

    return json({ success: true, message: "Deleted." });
  } catch (err) {
    return serverError(err);
  }
}
