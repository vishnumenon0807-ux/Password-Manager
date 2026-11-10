import crypto from "node:crypto";

// AES-256-GCM encryption for vault secrets (saved passwords and notes).
//
// Stored format:  v1:<iv>:<auth tag>:<ciphertext>   (each part base64)
//
// - A fresh random 12-byte IV is used for every encryption, so saving the
//   same password twice gives two different ciphertexts.
// - GCM's auth tag means any change to the stored value (or the wrong key)
//   makes decryption fail loudly instead of returning garbage.
// - The owner's user id is passed as additional authenticated data (AAD).
//   If someone with database access copies one user's ciphertext into
//   another user's row, it will not decrypt there.
// - The "v1" prefix leaves room to rotate keys or change the scheme later.

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";

let cachedKey = null;

function getKey() {
  if (cachedKey) return cachedKey;

  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Run `npm run gen-keys` and copy the output into .env.local."
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 random bytes, base64 encoded.");
  }

  cachedKey = key;
  return key;
}

function aadFor(userId) {
  return Buffer.from(`passvault:user:${userId}`, "utf8");
}

export function encrypt(plainText, userId) {
  if (plainText === null || plainText === undefined || plainText === "") {
    return null;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  cipher.setAAD(aadFor(userId));

  const cipherText = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    cipherText.toString("base64"),
  ].join(":");
}

export function decrypt(payload, userId) {
  if (!payload) return "";

  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== VERSION || !ivB64 || !tagB64 || dataB64 === undefined) {
    throw new Error("Unrecognised encrypted value format.");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAAD(aadFor(userId));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
