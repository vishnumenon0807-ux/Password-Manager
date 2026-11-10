// Creates the database (if it does not exist yet) and the tables.
// Run with:  npm run db:setup   (reads connection settings from .env.local)

import { readFile } from "node:fs/promises";
import pg from "pg";

const schemaUrl = new URL("../db/schema.sql", import.meta.url);

function clientConfig(database) {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    if (database) url.pathname = `/${database}`;
    return { connectionString: url.toString() };
  }
  return database ? { database } : {};
}

function targetDatabase() {
  if (process.env.DATABASE_URL) {
    return new URL(process.env.DATABASE_URL).pathname.slice(1);
  }
  return process.env.PGDATABASE;
}

async function connect() {
  const client = new pg.Client(clientConfig());
  try {
    await client.connect();
    return client;
  } catch (err) {
    // 3D000 = database does not exist. Create it from the default
    // "postgres" database, then connect again.
    if (err.code !== "3D000") throw err;

    const name = targetDatabase();
    if (!name || !/^[A-Za-z0-9_]+$/.test(name)) throw err;

    console.log(`Database "${name}" not found, creating it...`);
    const admin = new pg.Client(clientConfig("postgres"));
    await admin.connect();
    await admin.query(`CREATE DATABASE "${name}"`);
    await admin.end();

    const retry = new pg.Client(clientConfig());
    await retry.connect();
    return retry;
  }
}

const client = await connect();

// If this database already has "users" or "passwords" tables from the old
// version of the app, CREATE TABLE IF NOT EXISTS would skip them and the
// app would fail later on missing columns. Check before touching anything.
async function oldTablesProblem() {
  const { rows } = await client.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name IN ('users', 'passwords')
  `);
  const tableExists = (t) => rows.some((r) => r.table_name === t);
  const has = (t, c) => rows.some((r) => r.table_name === t && r.column_name === c);

  return [
    ["users", "password_hash"],
    ["passwords", "user_id"],
    ["passwords", "password_enc"],
    ["passwords", "favorite"],
  ].filter(([t, c]) => tableExists(t) && !has(t, c));
}

try {
  const missing = await oldTablesProblem();

  if (missing.length > 0) {
    console.error(
      "\nThis database has older users/passwords tables with different columns:\n  " +
        missing.map(([t, c]) => `${t}.${c} is missing`).join("\n  ") +
        "\nPoint PGDATABASE at a new database (for example passvault) and run this again." +
        "\nNothing was changed.\n"
    );
    process.exitCode = 1;
  } else {
    await client.query(await readFile(schemaUrl, "utf8"));
    const { rows: [db] } = await client.query("SELECT current_database() AS name");
    console.log(`Tables are ready in database "${db.name}".`);
  }
} finally {
  await client.end();
}
