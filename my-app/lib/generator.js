// Random password generator. Uses crypto.getRandomValues (available in
// browsers and in Node 20+), never Math.random.

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
};

// Characters that are easy to misread when typing a password by hand.
const AMBIGUOUS = /[Il1O0o]/g;

export const DEFAULT_OPTIONS = {
  length: 20,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
};

// Uniform random integer in [0, max). Rejection sampling avoids the bias
// you get from `random % max` when max does not divide 2^32 evenly.
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function pick(chars) {
  return chars[randomInt(chars.length)];
}

export function generatePassword(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const length = Math.min(Math.max(Number(opts.length) || 20, 8), 128);

  const groups = Object.keys(SETS)
    .filter((name) => opts[name])
    .map((name) =>
      opts.avoidAmbiguous ? SETS[name].replace(AMBIGUOUS, "") : SETS[name]
    );

  if (groups.length === 0) {
    throw new Error("Pick at least one character type.");
  }

  // One character from every chosen group, so a password with "numbers"
  // ticked always contains at least one number. The rest come from all
  // groups combined, then the whole thing is shuffled.
  const all = groups.join("");
  const chars = groups.map(pick);
  while (chars.length < length) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
