-- PassVault schema. Safe to run more than once.

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          TEXT,
    email         TEXT NOT NULL UNIQUE,      -- always stored lowercase
    password_hash TEXT,                      -- bcrypt; NULL for Google-only accounts
    image         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per saved login. The password and notes are AES-256-GCM
-- ciphertext ("v1:<iv>:<tag>:<data>"), never plain text. Website, URL,
-- username and category stay readable so the vault can be listed and
-- searched without decrypting every entry.
CREATE TABLE IF NOT EXISTS passwords (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    website      TEXT NOT NULL,
    url          TEXT,
    username     TEXT NOT NULL DEFAULT '',
    password_enc TEXT NOT NULL,
    notes_enc    TEXT,
    category     TEXT NOT NULL DEFAULT 'Other',
    favorite     BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS passwords_user_id_idx ON passwords (user_id);
