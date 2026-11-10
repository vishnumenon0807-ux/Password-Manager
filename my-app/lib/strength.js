// Password strength checker. Runs in the browser (live meter on the form)
// and on the server (weak password report, statistics, signup check), so it
// has no imports.
//
// It estimates entropy from length and character variety, then knocks the
// score down for patterns that make a password easy to guess: common
// passwords (including "Password1!" style variations), sequences like
// "abc" or "123", keyboard runs like "qwerty", and repeated characters.

const COMMON_PASSWORDS = new Set([
  "password", "passw0rd", "123456", "1234567", "12345678", "123456789",
  "1234567890", "12345", "111111", "000000", "123123", "654321", "qwerty",
  "qwertyuiop", "asdfgh", "asdfghjkl", "zxcvbnm", "abc123", "iloveyou",
  "admin", "administrator", "welcome", "letmein", "monkey", "dragon",
  "football", "cricket", "baseball", "sunshine", "princess", "master",
  "login", "shadow", "superman", "batman", "trustno1", "hello", "freedom",
  "whatever", "starwars", "secret", "india", "default", "changeme",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

export const STRENGTH_LABELS = [
  "Very weak",
  "Weak",
  "Fair",
  "Strong",
  "Very strong",
];

// Undo common character swaps and strip the digits/symbols people tack on
// at the end, so "P@ssw0rd2024!" is recognised as "password".
function baseWord(password) {
  return password
    .toLowerCase()
    .replace(/[^a-z@$0-9]+$/g, "")
    .replace(/\d+$/g, "")
    .replace(/[^a-z]+$/g, "")
    .replace(/^\d+/g, "")
    .replace(/[@4]/g, "a")
    .replace(/3/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z]+$/g, "")
    .replace(/^[^a-z]+/g, "");
}

function hasSequence(password, minRun = 3) {
  const lower = password.toLowerCase();
  let up = 1;
  let down = 1;

  for (let i = 1; i < lower.length; i++) {
    const diff = lower.charCodeAt(i) - lower.charCodeAt(i - 1);
    up = diff === 1 ? up + 1 : 1;
    down = diff === -1 ? down + 1 : 1;
    if (up >= minRun || down >= minRun) return true;
  }

  return KEYBOARD_ROWS.some((row) => {
    for (let i = 0; i + 4 <= row.length; i++) {
      if (lower.includes(row.slice(i, i + 4))) return true;
    }
    return false;
  });
}

function hasRepeats(password) {
  return /(.)\1\1/.test(password);
}

export function checkStrength(password) {
  if (!password) {
    return { score: 0, label: STRENGTH_LABELS[0], bits: 0, feedback: ["Enter a password."] };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const pool =
    (hasLower ? 26 : 0) +
    (hasUpper ? 26 : 0) +
    (hasDigit ? 10 : 0) +
    (hasSymbol ? 33 : 0);

  let bits = length * Math.log2(Math.max(pool, 1));
  const feedback = [];

  const sequence = hasSequence(password);
  const repeats = hasRepeats(password);
  if (sequence) {
    bits *= 0.75;
    feedback.push("Avoid sequences like abc, 123 or qwerty.");
  }
  if (repeats) {
    bits *= 0.8;
    feedback.push("Avoid repeating the same character.");
  }

  let score;
  if (bits < 28) score = 0;
  else if (bits < 40) score = 1;
  else if (bits < 60) score = 2;
  else if (bits < 80) score = 3;
  else score = 4;

  // A long string of one or two characters ("aaaaaaaaaaaa") has almost no
  // real entropy, whatever its length says.
  const unique = new Set(password).size;
  if (unique <= 2) score = 0;
  else if (unique <= 4) score = Math.min(score, 1);

  const common =
    COMMON_PASSWORDS.has(password.toLowerCase()) ||
    COMMON_PASSWORDS.has(baseWord(password));
  if (common) {
    score = Math.min(score, COMMON_PASSWORDS.has(password.toLowerCase()) ? 0 : 1);
    feedback.unshift("This is a very common password or a small change to one.");
  }

  if (length < 12) feedback.push("Use at least 12 characters.");
  if (!hasUpper) feedback.push("Add uppercase letters.");
  if (!hasLower) feedback.push("Add lowercase letters.");
  if (!hasDigit) feedback.push("Add numbers.");
  if (!hasSymbol) feedback.push("Add symbols.");

  return {
    score,
    label: STRENGTH_LABELS[score],
    bits: Math.round(bits),
    feedback,
  };
}

// Very weak and Weak both count as "weak" across the app.
export function isWeak(password) {
  return checkStrength(password).score < 2;
}
