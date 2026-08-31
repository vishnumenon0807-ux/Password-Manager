import { Client } from "pg";

const db = new Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "12345234534545",
    port: 5432,
});

await db.connect();

export default db;