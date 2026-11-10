import { Pool } from "pg";

// Connection settings come from the environment, never from source code.
// Either set DATABASE_URL, or the standard PG* variables (PGHOST, PGPORT,
// PGUSER, PGPASSWORD, PGDATABASE), which pg reads on its own. The PG* form
// is easier when the password has characters like @ or # in it.
//
// The pool is kept on globalThis so hot reloads in `next dev` reuse it
// instead of opening a new set of connections on every file save.
const globalForDb = globalThis;

const pool =
  globalForDb.__passvaultPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__passvaultPool = pool;
}

export function query(text, params) {
  return pool.query(text, params);
}

export default pool;
