# PassVault

A password manager built with Next.js 16, React 19, PostgreSQL, NextAuth.js and Tailwind CSS. Every saved password and note is encrypted with AES-256-GCM before it is written to the database.

The app lives in the `my-app` folder.

## Features

- Sign up and log in with email and password, or with Google (NextAuth.js, JWT sessions)
- Saved passwords and secure notes encrypted with AES-256-GCM
- Password generator (length 8 to 64, choice of character types, option to skip look-alike characters like `l`, `1`, `O`, `0`)
- Live strength meter with tips, used on the add/edit form, signup and settings
- Vault with search, category filter, sort, favourites, show/hide and one-click copy
- Weak password report: weak, reused, and not changed in 180+ days
- Statistics: security score, strength breakdown, category breakdown
- Settings: change name, change or set password, delete account

## How the security works

**Saved passwords and notes.** `lib/crypto.js` encrypts with AES-256-GCM using the key in `ENCRYPTION_KEY`. Each value gets a fresh random 12-byte IV, and GCM's auth tag makes decryption fail if the stored value is changed. The owner's user id is bound in as additional authenticated data, so a ciphertext copied into another user's row won't decrypt. The database only ever holds strings like `v1:<iv>:<tag>:<ciphertext>`.

**Passwords leave the server only when asked for.** `GET /api/vault` returns the list with strength ratings and reuse counts but no passwords. The decrypted password for one entry is fetched only when you click Show, Copy or Edit on it, and it hides itself again after 20 seconds.

**Login passwords** are hashed with bcrypt (cost 12). Logins for unknown emails still run a bcrypt comparison, so response time doesn't reveal which emails have accounts.

**Each user sees only their own data.** Every query includes `WHERE user_id = $n` with the id from the session, so guessing another entry's id returns 404. Deleting an account removes all its entries (`ON DELETE CASCADE`) and ends access straight away, even though the old session cookie hasn't expired yet.

**CSRF and clickjacking.** The session cookie is `SameSite=Lax`, and the API routes that change data only accept `application/json`, which a form on another site can't send. `next.config.ts` sends `X-Frame-Options: DENY` and `frame-ancestors 'none'` so the app can't be loaded inside another site's iframe.

**The limitation to know about.** The server holds `ENCRYPTION_KEY`, so this isn't zero-knowledge like Bitwarden or 1Password, where the key comes from your master password in the browser. Someone who gets both the database and the key can decrypt everything. A stolen database on its own gives away no saved passwords or notes, though website names, URLs and usernames are stored readable so the vault can be listed and searched.

## Running it on Windows

You need Node.js 20.9 or newer and PostgreSQL running locally.

1. Install the packages:

   ```bash
   cd my-app
   npm install
   ```

2. Create your env file:

   ```bash
   copy .env.example .env.local
   ```

3. Generate the two secrets and paste the output into `.env.local`:

   ```bash
   npm run gen-keys
   ```

4. In `.env.local`, set `PGPASSWORD` to your Postgres password. Leave `PGDATABASE=passvault` unless you want a different name.

5. Create the database and tables:

   ```bash
   npm run db:setup
   ```

   This creates the `passvault` database if it doesn't exist. Use a new database rather than the old `world` one: its `users` and `passwords` tables have different columns, and the script will stop and tell you so.

6. Start the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 and sign up.

Back up `ENCRYPTION_KEY` somewhere safe. If it's lost or changed, saved passwords can't be decrypted.

## Turning on Google sign-in

Google sign-in is off until both Google variables are set. Email and password login works without it.

1. Go to https://console.cloud.google.com/apis/credentials and create an OAuth client ID of type "Web application".
2. Add `http://localhost:3000/api/auth/callback/google` as an authorised redirect URI.
3. Put the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`, then restart `npm run dev`.

A "Continue with Google" button then shows on the login and signup pages. If you sign in with Google using the same email as an existing account, it logs into that account. People who signed up with Google can set a password in Settings to log in with email as well.

## Project layout

```
my-app/
  app/
    page.jsx                  landing page
    login/, signup/           auth pages
    (app)/                    pages that need a logged-in user (the folder name isn't in the URL)
      layout.jsx              nav bar + login check
      dashboard/              live counts and shortcuts
      vault/                  list, vault/new, vault/[id]/edit
      favorites/
      weak-passwords/
      statistics/
      settings/
    api/
      auth/[...nextauth]/     NextAuth (login, logout, Google)
      signup/                 POST create account
      vault/                  GET list, POST create
      vault/[id]/             GET one (decrypted), PATCH update, DELETE
      account/                PATCH name, DELETE account
      account/password/       POST change or set password
  components/                 client components (forms, cards, generator, strength meter)
  lib/
    auth.js                   NextAuth config
    crypto.js                 AES-256-GCM encrypt/decrypt
    db.js                     PostgreSQL pool
    vault.js                  vault queries, reuse detection, stats
    strength.js               strength checker (browser and server)
    generator.js              password generator (crypto.getRandomValues)
    session.js                session helpers for API routes and pages
  db/schema.sql
  scripts/setup-db.mjs, scripts/gen-keys.mjs
```
