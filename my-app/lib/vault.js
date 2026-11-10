import { query } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import { checkStrength } from "@/lib/strength";
import { CATEGORIES, normaliseCategory } from "@/lib/categories";

// Every function here takes the signed-in user's id and puts it in the
// WHERE clause, so one user can never read or change another user's rows,
// even by guessing ids.

const LIMITS = { website: 200, url: 500, username: 200, password: 500, notes: 5000 };
const OLD_AFTER_DAYS = 180;

function cleanUrl(value) {
  const url = String(value ?? "").trim();
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(withScheme);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

// Checks and tidies an entry from the request body. With `partial`, only
// the fields present are checked (used for PATCH).
export function validateEntry(body, { partial = false } = {}) {
  const values = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("website")) {
    const website = String(body.website ?? "").trim();
    if (!website) return { error: "Enter the website or app name." };
    if (website.length > LIMITS.website) return { error: "Website name is too long." };
    values.website = website;
  }

  if (!partial || has("url")) {
    const raw = String(body.url ?? "").trim();
    if (raw.length > LIMITS.url) return { error: "URL is too long." };
    const url = cleanUrl(raw);
    if (raw && !url) return { error: "That URL doesn't look right." };
    values.url = url;
  }

  if (!partial || has("username")) {
    const username = String(body.username ?? "").trim();
    if (username.length > LIMITS.username) return { error: "Username is too long." };
    values.username = username;
  }

  if (!partial || has("password")) {
    const password = String(body.password ?? "");
    if (!password) return { error: "Enter the password to save." };
    if (password.length > LIMITS.password) return { error: "Password is too long." };
    values.password = password;
  }

  if (!partial || has("notes")) {
    const notes = String(body.notes ?? "");
    if (notes.length > LIMITS.notes) return { error: "Notes are too long." };
    values.notes = notes;
  }

  if (!partial || has("category")) {
    values.category = normaliseCategory(body.category);
  }

  if (!partial || has("favorite")) {
    values.favorite = body.favorite === true;
  }

  if (partial && Object.keys(values).length === 0) {
    return { error: "Nothing to update." };
  }

  return { values };
}

function publicFields(row) {
  return {
    id: row.id,
    website: row.website,
    url: row.url,
    username: row.username,
    category: row.category,
    favorite: row.favorite,
    hasNotes: Boolean(row.notes_enc),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Lists the vault without sending any passwords. Each entry still gets a
// strength rating and a reuse count, which are worked out here on the
// server by decrypting in memory.
export async function listEntries(userId) {
  const { rows } = await query(
    `SELECT id, website, url, username, category, favorite, password_enc, notes_enc,
            created_at, updated_at
     FROM passwords
     WHERE user_id = $1
     ORDER BY lower(website), id`,
    [userId]
  );

  const plain = new Map();
  const counts = new Map();

  for (const row of rows) {
    try {
      const password = decrypt(row.password_enc, userId);
      plain.set(row.id, password);
      counts.set(password, (counts.get(password) ?? 0) + 1);
    } catch {
      plain.set(row.id, null);
    }
  }

  return rows.map((row) => {
    const password = plain.get(row.id);
    if (password === null) {
      return { ...publicFields(row), strength: null, reusedWith: 0, decryptFailed: true };
    }
    const { score, label, feedback } = checkStrength(password);
    return {
      ...publicFields(row),
      strength: { score, label, hint: feedback[0] ?? null },
      reusedWith: counts.get(password) - 1,
      decryptFailed: false,
    };
  });
}

export class DecryptError extends Error {}

function decryptOrThrow(value, userId) {
  try {
    return decrypt(value, userId);
  } catch {
    throw new DecryptError(
      "This entry can't be decrypted. ENCRYPTION_KEY may have changed since it was saved."
    );
  }
}

export async function getEntry(userId, id) {
  const { rows } = await query(
    `SELECT id, website, url, username, category, favorite, password_enc, notes_enc,
            created_at, updated_at
     FROM passwords
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    ...publicFields(row),
    password: decryptOrThrow(row.password_enc, userId),
    notes: decryptOrThrow(row.notes_enc, userId),
  };
}

export async function createEntry(userId, values) {
  const { rows } = await query(
    `INSERT INTO passwords
       (user_id, website, url, username, password_enc, notes_enc, category, favorite)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      userId,
      values.website,
      values.url,
      values.username,
      encrypt(values.password, userId),
      encrypt(values.notes, userId),
      values.category,
      values.favorite,
    ]
  );
  return rows[0].id;
}

export async function updateEntry(userId, id, values) {
  const columns = {
    website: values.website,
    url: values.url,
    username: values.username,
    category: values.category,
    favorite: values.favorite,
  };
  if ("password" in values) columns.password_enc = encrypt(values.password, userId);
  if ("notes" in values) columns.notes_enc = encrypt(values.notes, userId);

  const sets = [];
  const params = [];
  for (const [column, value] of Object.entries(columns)) {
    if (value === undefined) continue;
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  }

  // Only real edits move "last changed"; starring an entry doesn't.
  const onlyFavorite = sets.length === 1 && columns.favorite !== undefined;
  if (!onlyFavorite) sets.push("updated_at = now()");

  params.push(id, userId);
  const result = await query(
    `UPDATE passwords SET ${sets.join(", ")}
     WHERE id = $${params.length - 1} AND user_id = $${params.length}`,
    params
  );
  return result.rowCount === 1;
}

export async function deleteEntry(userId, id) {
  const result = await query("DELETE FROM passwords WHERE id = $1 AND user_id = $2", [
    id,
    userId,
  ]);
  return result.rowCount === 1;
}

// Numbers for the dashboard, statistics page and weak password report.
export async function getStats(userId) {
  const entries = await listEntries(userId);
  const readable = entries.filter((e) => !e.decryptFailed);
  const cutoff = Date.now() - OLD_AFTER_DAYS * 24 * 60 * 60 * 1000;

  const weak = readable.filter((e) => e.strength.score < 2);
  const reused = readable.filter((e) => e.reusedWith > 0);
  const old = readable.filter((e) => new Date(e.updatedAt).getTime() < cutoff);
  const healthy = readable.filter((e) => e.strength.score >= 3 && e.reusedWith === 0);

  const byStrength = [0, 0, 0, 0, 0];
  for (const e of readable) byStrength[e.strength.score] += 1;

  const byCategory = CATEGORIES.map((name) => ({
    name,
    count: entries.filter((e) => e.category === name).length,
  })).filter((c) => c.count > 0);

  return {
    entries,
    total: entries.length,
    favorites: entries.filter((e) => e.favorite).length,
    weak,
    reused,
    old,
    oldAfterDays: OLD_AFTER_DAYS,
    healthy: healthy.length,
    // Share of entries that are Strong or Very strong and not reused.
    securityScore: readable.length ? Math.round((healthy.length / readable.length) * 100) : null,
    byStrength,
    byCategory,
    decryptFailed: entries.length - readable.length,
  };
}

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
