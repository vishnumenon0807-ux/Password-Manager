// Prints fresh random secrets for .env.local.
// Run with:  npm run gen-keys

import crypto from "node:crypto";

console.log(`ENCRYPTION_KEY=${crypto.randomBytes(32).toString("base64")}`);
console.log(`NEXTAUTH_SECRET=${crypto.randomBytes(32).toString("base64")}`);
